const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contextRoutes = require('./routes/context');
const agentRoutes = require('./routes/agents');
const settingsRoutes = require('./routes/settings');
const activityRoutes = require('./routes/activities');
const taskRoutes = require('./routes/tasks');
const uploadRoutes = require('./routes/uploads');
const statsRoutes = require('./routes/stats');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let botClient = null;

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'bot_status_update') {
      if (data.bot) {
        botClient = ws;
      }
      
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'bot_status_update',
            bot: data.bot || 'OpenClaw Bot',
            status: data.status,
            timestamp: data.timestamp
          }));
        }
      });
    } else if (data.type === 'task_update') {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } else if (data.type === 'send_to_bot') {
      if (botClient && botClient.readyState === WebSocket.OPEN) {
        botClient.send(JSON.stringify({
          type: data.command,
          ...data.params
        }));
      }
    }
  });

  ws.on('close', () => {
    if (ws === botClient) {
      botClient = null;
    }
    console.log('WebSocket disconnected');
  });
});

app.post('/api/bot/command', (req, res) => {
  const { command, params } = req.body;
  
  if (botClient && botClient.readyState === WebSocket.OPEN) {
    botClient.send(JSON.stringify({
      type: command,
      ...params
    }));
    res.json({ success: true, message: 'Befehl an Bot gesendet' });
  } else {
    res.status(503).json({ success: false, message: 'Bot nicht verbunden' });
  }
});

app.get('/api/bot/status', (req, res) => {
  res.json({
    connected: botClient !== null,
    status: botClient ? 'online' : 'offline'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});