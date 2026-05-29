const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

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

router.post('/request', authMiddleware, (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'Location required' });

  const active = db.prepare(
    "SELECT id FROM emergency_requests WHERE requester_id = ? AND status IN ('pending', 'accepted')"
  ).get(req.user.id);
  if (active) return res.status(409).json({ error: 'You already have an active request', requestId: active.id });

  const result = db.prepare(
    'INSERT INTO emergency_requests (requester_id, requester_lat, requester_lng) VALUES (?, ?, ?)'
  ).run(req.user.id, lat, lng);

  const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(result.lastInsertRowid);

  const providers = db.prepare(
    "SELECT id, name, lat, lng FROM users WHERE role = 'provider' AND is_available = 1 AND lat IS NOT NULL AND lng IS NOT NULL"
  ).all();

  const nearbyProviders = providers.filter(
    (p) => getDistance(lat, lng, p.lat, p.lng) <= 10
  );

  res.json({ request, notifiedCount: nearbyProviders.length });
});

router.get('/request/:id', authMiddleware, (req, res) => {
  const request = db.prepare(`
    SELECT er.*,
      u.name as requester_name,
      p.name as provider_name, p.phone as provider_phone, p.lat as provider_lat, p.lng as provider_lng
    FROM emergency_requests er
    JOIN users u ON er.requester_id = u.id
    LEFT JOIN users p ON er.accepted_by = p.id
    WHERE er.id = ?
  `).get(req.params.id);

  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.requester_id !== req.user.id && req.user.role !== 'provider')
    return res.status(403).json({ error: 'Forbidden' });

  res.json(request);
});

router.get('/my-request', authMiddleware, (req, res) => {
  const request = db.prepare(`
    SELECT er.*,
      p.name as provider_name, p.phone as provider_phone, p.lat as provider_lat, p.lng as provider_lng
    FROM emergency_requests er
    LEFT JOIN users p ON er.accepted_by = p.id
    WHERE er.requester_id = ? AND er.status IN ('pending', 'accepted')
    ORDER BY er.created_at DESC LIMIT 1
  `).get(req.user.id);

  res.json(request || null);
});

router.post('/request/:id/accept', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Only providers can accept' });

  const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') return res.status(409).json({ error: 'Request already handled' });

  db.prepare(
    "UPDATE emergency_requests SET status = 'accepted', accepted_by = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(req.user.id, req.params.id);

  const updated = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.post('/request/:id/complete', authMiddleware, (req, res) => {
  const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const isRequester = request.requester_id === req.user.id;
  const isProvider = request.accepted_by === req.user.id;
  if (!isRequester && !isProvider) return res.status(403).json({ error: 'Forbidden' });

  db.prepare(
    "UPDATE emergency_requests SET status = 'completed', updated_at = datetime('now') WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

router.post('/request/:id/cancel', authMiddleware, (req, res) => {
  const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.requester_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.prepare(
    "UPDATE emergency_requests SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

router.get('/active', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Providers only' });

  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Location required' });

  const requests = db.prepare(`
    SELECT er.*, u.name as requester_name
    FROM emergency_requests er
    JOIN users u ON er.requester_id = u.id
    WHERE er.status = 'pending'
    ORDER BY er.created_at DESC
  `).all();

  const nearby = requests
    .map((r) => ({
      ...r,
      distance: getDistance(parseFloat(lat), parseFloat(lng), r.requester_lat, r.requester_lng),
    }))
    .filter((r) => r.distance <= 20)
    .sort((a, b) => a.distance - b.distance);

  res.json(nearby);
});

module.exports = router;
