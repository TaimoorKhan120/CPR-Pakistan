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

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Socket.io real-time layer
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

  socket.on('update_location', ({ lat, lng }) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    db.prepare('UPDATE users SET lat = ?, lng = ? WHERE id = ?').run(lat, lng, userId);

    if (socket.user.role === 'provider') {
      const acceptedRequests = db.prepare(
        "SELECT * FROM emergency_requests WHERE accepted_by = ? AND status = 'accepted'"
      ).all(userId);

      for (const req of acceptedRequests) {
        const requesterSocketId = connectedUsers.get(req.requester_id);
        if (requesterSocketId) {
          io.to(requesterSocketId).emit('provider_location', { lat, lng, providerId: userId });
        }
      }
    }

    if (socket.user.role === 'provider') {
      const user = db.prepare('SELECT is_available FROM users WHERE id = ?').get(userId);
      if (user?.is_available) {
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

        const pendingRequests = db.prepare(
          "SELECT er.*, u.name as requester_name FROM emergency_requests er JOIN users u ON er.requester_id = u.id WHERE er.status = 'pending'"
        ).all();

        for (const req of pendingRequests) {
          const dist = getDistance(lat, lng, req.requester_lat, req.requester_lng);
          if (dist <= 10) {
            socket.emit('new_emergency', { ...req, distance: dist.toFixed(2) });
          }
        }
      }
    }
  });

  socket.on('emergency_request', ({ requestId }) => {
    const providers = db.prepare(
      "SELECT id FROM users WHERE role = 'provider' AND is_available = 1"
    ).all();

    const request = db.prepare(
      'SELECT er.*, u.name as requester_name FROM emergency_requests er JOIN users u ON er.requester_id = u.id WHERE er.id = ?'
    ).get(requestId);

    if (!request) return;

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

    let notified = 0;
    for (const provider of providers) {
      const pUser = db.prepare('SELECT lat, lng FROM users WHERE id = ?').get(provider.id);
      if (!pUser?.lat || !pUser?.lng) continue;
      const dist = getDistance(request.requester_lat, request.requester_lng, pUser.lat, pUser.lng);
      if (dist <= 10) {
        const providerSocket = connectedUsers.get(provider.id);
        if (providerSocket) {
          io.to(providerSocket).emit('new_emergency', { ...request, distance: dist.toFixed(2) });
          notified++;
        }
      }
    }

    socket.emit('providers_notified', { count: notified });
  });

  socket.on('accept_request', ({ requestId }) => {
    if (socket.user.role !== 'provider') return;

    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    if (!request || request.status !== 'pending') return;

    db.prepare(
      "UPDATE emergency_requests SET status = 'accepted', accepted_by = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(userId, requestId);

    const provider = db.prepare('SELECT id, name, phone FROM users WHERE id = ?').get(userId);
    const requesterSocket = connectedUsers.get(request.requester_id);
    if (requesterSocket) {
      io.to(requesterSocket).emit('request_accepted', { provider, requestId });
    }
  });

  socket.on('request_cancelled', ({ requestId }) => {
    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    if (!request) return;
    if (request.accepted_by) {
      const providerSocket = connectedUsers.get(request.accepted_by);
      if (providerSocket) io.to(providerSocket).emit('request_cancelled', { requestId });
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
  });
});

server.listen(PORT, () => {
  console.log(`CPR Pakistan server running on port ${PORT}`);
});
