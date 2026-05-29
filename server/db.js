const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'cpr_pakistan.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('bystander', 'provider')),
    city TEXT NOT NULL,
    is_available INTEGER DEFAULT 0,
    lat REAL,
    lng REAL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS emergency_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    requester_lat REAL NOT NULL,
    requester_lng REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'completed', 'cancelled')),
    accepted_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (accepted_by) REFERENCES users(id)
  );
`);

module.exports = db;
