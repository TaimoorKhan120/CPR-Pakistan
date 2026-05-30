const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/request/:requestId', authMiddleware, (req, res) => {
  const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(req.params.requestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const isParticipant = request.requester_id === req.user.id || request.accepted_by === req.user.id;
  if (!isParticipant) return res.status(403).json({ error: 'Forbidden' });

  const messages = db.prepare(`
    SELECT cm.*, u.name as sender_name, u.role as sender_role
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE cm.request_id = ?
    ORDER BY cm.created_at ASC
  `).all(req.params.requestId);

  res.json(messages);
});

module.exports = router;
