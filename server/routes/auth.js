const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cpr-pakistan-secret-2024';

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, city } = req.body;
    if (!name || !phone || !password || !role || !city)
      return res.status(400).json({ error: 'All fields are required' });
    if (!['bystander', 'provider'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) return res.status(409).json({ error: 'Phone number already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, phone, password, role, city) VALUES (?, ?, ?, ?, ?)'
    ).run(name, phone, hashed, role, city);

    const user = db.prepare('SELECT id, name, phone, role, city, is_available FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, phone, role, city, is_available, lat, lng FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/availability', authMiddleware, (req, res) => {
  const { is_available } = req.body;
  db.prepare('UPDATE users SET is_available = ? WHERE id = ?').run(is_available ? 1 : 0, req.user.id);
  res.json({ success: true, is_available: !!is_available });
});

module.exports = router;
