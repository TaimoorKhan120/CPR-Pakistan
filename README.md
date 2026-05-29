# CPR Pakistan 🇵🇰

**Emergency BLS Response Network — "Uber for BLS Providers"**

CPR Pakistan connects people in cardiac emergencies with nearby trained Basic Life Support (BLS) providers in real time — like Uber, but for saving lives.

---

## Features

- 🆘 **Emergency Alert** — Bystanders send a live alert; nearby BLS providers are notified instantly via WebSocket
- 📍 **Real-time Tracking** — Once a provider accepts, their GPS location streams live to the requester (like Uber)
- 🏥 **Provider Dashboard** — BLS providers receive alerts, can accept/decline, and navigate to the patient
- 📞 **One-tap 1122** — Single tap calls Pakistan emergency services
- 💬 **WhatsApp Location Share** — One tap sends your GPS coordinates as a Google Maps link via WhatsApp
- 📚 **BLS Education** — Full bilingual (English + اردو) CPR, AED, Recovery Position, and Choking guides with step-by-step instructions
- 🔄 **Real-time via WebSocket** — Socket.io for instant alerts and live location streaming

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express + Socket.io |
| Database | SQLite (better-sqlite3) |
| Maps | Leaflet.js + OpenStreetMap (free) |
| Auth | JWT tokens |
| Real-time | WebSocket (Socket.io) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone <repo-url>
cd CPR-Pakistan

# Install all dependencies (root + server + client)
npm run install:all

# Start both server and client in dev mode
npm run dev
```

- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001

---

## Project Structure

```
CPR-Pakistan/
├── package.json          # Root: concurrently runs server + client
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── db.js             # SQLite schema & connection
│   ├── routes/
│   │   ├── auth.js       # Register, login, availability
│   │   └── emergency.js  # Emergency request CRUD
│   └── middleware/
│       └── auth.js       # JWT middleware
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── contexts/
    │   │   ├── AuthContext.jsx    # Auth state
    │   │   └── SocketContext.jsx  # WebSocket connection
    │   ├── pages/
    │   │   ├── Home.jsx           # Dashboard + quick actions
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Emergency.jsx      # Send alert + track responder
    │   │   ├── ProviderDashboard.jsx  # Receive alerts + respond
    │   │   └── Learn.jsx          # BLS education (EN + UR)
    │   └── components/
    │       ├── Layout.jsx         # Nav shell
    │       └── EmergencyMap.jsx   # Leaflet map component
    └── vite.config.js    # Proxies /api + /socket.io → server
```

---

## User Roles

| Role | Can Do |
|------|--------|
| **Bystander** | Send emergency alerts, track responder, call 1122, share location |
| **BLS Provider** | Set availability, receive emergency alerts, accept/decline, navigate to patient |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | `cpr-pakistan-secret-2024` | JWT signing secret (change in production) |

---

## License

Free to use for all Pakistanis. Built to save lives. 🤍
