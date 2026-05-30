const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const JWT_SECRET = process.env.JWT_SECRET || 'cpr-pakistan-secret-2024';
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Haversine distance in km
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ETA in minutes assuming ~30 km/h average urban speed
function calcETA(distKm) {
  return Math.max(1, Math.round((distKm / 30) * 60));
}

const connectedUsers = new Map(); // userId -> socketId

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  connectedUsers.set(userId, socket.id);

  // Location update — streams to requester if provider is en route, also checks for new nearby requests
  socket.on('update_location', ({ lat, lng }) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    db.prepare('UPDATE users SET lat = ?, lng = ? WHERE id = ?').run(lat, lng, userId);

    if (socket.user.role === 'provider') {
      // Stream location + ETA to requester for any active accepted request
      const accepted = db.prepare(
        "SELECT * FROM emergency_requests WHERE accepted_by = ? AND status = 'accepted'"
      ).all(userId);

      for (const req of accepted) {
        const dist = getDistance(lat, lng, req.requester_lat, req.requester_lng);
        const eta = calcETA(dist);
        const requesterSocket = connectedUsers.get(req.requester_id);
        if (requesterSocket) {
          io.to(requesterSocket).emit('provider_location', { lat, lng, providerId: userId, eta });
        }
      }

      // Notify provider of any nearby pending requests within their radius
      const providerUser = db.prepare('SELECT is_available, response_radius FROM users WHERE id = ?').get(userId);
      if (providerUser?.is_available) {
        const radius = providerUser.response_radius || 5;
        const pending = db.prepare(
          "SELECT er.*, u.name as requester_name FROM emergency_requests er JOIN users u ON er.requester_id = u.id WHERE er.status = 'pending'"
        ).all();
        for (const req of pending) {
          const dist = getDistance(lat, lng, req.requester_lat, req.requester_lng);
          if (dist <= radius) {
            socket.emit('new_emergency', { ...req, distance: +dist.toFixed(2), eta: calcETA(dist) });
          }
        }
      }
    }
  });

  // Bystander broadcasts a new emergency to all online available providers within their radius
  socket.on('emergency_request', ({ requestId }) => {
    const request = db.prepare(
      'SELECT er.*, u.name as requester_name FROM emergency_requests er JOIN users u ON er.requester_id = u.id WHERE er.id = ?'
    ).get(requestId);
    if (!request) return;

    const providers = db.prepare(
      "SELECT id, lat, lng, response_radius FROM users WHERE role = 'provider' AND is_available = 1 AND lat IS NOT NULL AND lng IS NOT NULL"
    ).all();

    let notified = 0;
    for (const p of providers) {
      const dist = getDistance(request.requester_lat, request.requester_lng, p.lat, p.lng);
      const radius = p.response_radius || 5;
      if (dist <= radius) {
        const pSocket = connectedUsers.get(p.id);
        if (pSocket) {
          io.to(pSocket).emit('new_emergency', { ...request, distance: +dist.toFixed(2), eta: calcETA(dist) });
          notified++;
        }
      }
    }
    socket.emit('providers_notified', { count: notified });
  });

  // Provider accepts a request
  socket.on('accept_request', ({ requestId }) => {
    if (socket.user.role !== 'provider') return;
    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    if (!request || request.status !== 'pending') return;

    db.prepare(
      "UPDATE emergency_requests SET status = 'accepted', accepted_by = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(userId, requestId);

    const provider = db.prepare('SELECT id, name, phone, lat, lng FROM users WHERE id = ?').get(userId);
    const dist = provider.lat
      ? getDistance(provider.lat, provider.lng, request.requester_lat, request.requester_lng)
      : 0;
    const eta = calcETA(dist);

    const requesterSocket = connectedUsers.get(request.requester_id);
    if (requesterSocket) {
      io.to(requesterSocket).emit('request_accepted', { provider, requestId, eta });
    }
  });

  // Chat message
  socket.on('send_message', ({ requestId, message }) => {
    if (!message?.trim()) return;
    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    if (!request) return;

    const isParticipant = request.requester_id === userId || request.accepted_by === userId;
    if (!isParticipant) return;

    const result = db.prepare(
      'INSERT INTO chat_messages (request_id, sender_id, message) VALUES (?, ?, ?)'
    ).run(requestId, userId, message.trim());

    const sender = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(userId);
    const msgObj = {
      id: result.lastInsertRowid,
      request_id: requestId,
      sender_id: userId,
      sender_name: sender.name,
      sender_role: sender.role,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Send to both participants
    const otherUserId = request.requester_id === userId ? request.accepted_by : request.requester_id;
    const otherSocket = connectedUsers.get(otherUserId);
    if (otherSocket) io.to(otherSocket).emit('new_message', msgObj);
    socket.emit('new_message', msgObj); // echo back to sender
  });

  // Request cancelled
  socket.on('request_cancelled', ({ requestId }) => {
    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    if (!request) return;
    if (request.accepted_by) {
      const pSocket = connectedUsers.get(request.accepted_by);
      if (pSocket) io.to(pSocket).emit('request_cancelled', { requestId });
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
  });
});

server.listen(PORT, () => {
  console.log(`CPR Pakistan server running on port ${PORT}`);
});
