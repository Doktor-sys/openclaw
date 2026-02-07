# OpenClaw Dashboard

Professionelles Dashboard für OpenClaw mit React, Node.js, Supabase und WebSockets.

## Struktur

```
Dashboard/
├── backend/           # Node.js/Express Backend
│   ├── src/
│   │   ├── routes/    # API-Routen
│   │   ├── controllers/ # Controller-Logik
│   │   └── server.js  # Hauptserver mit WebSocket
├── frontend/          # React Frontend
│   └── src/
│       ├── components/
│       │   ├── Header/
│       │   ├── Navigation/
│       │   ├── Overview/
│       │   ├── Projects/
│       │   ├── Context/
│       │   ├── Agents/
│       │   └── Settings/
│       └── App.jsx
└── docker-compose.yml
```

## Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up
```

## Features

- React Frontend mit Tailwind CSS
- Node.js/Express Backend
- WebSocket Echtzeit-Updates
- Kanban-Board für Projekte
- Markdown-Editor für Kontext
- Agenten-Management
- Responsive Design