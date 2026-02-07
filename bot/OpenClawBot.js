const WebSocket = require('ws');
const axios = require('axios');

class OpenClawBot {
  constructor(config = {}) {
    this.name = config.name || 'OpenClaw Bot';
    this.wsUrl = config.wsUrl || 'ws://localhost:3002';
    this.apiUrl = config.apiUrl || 'http://localhost:3002';
    this.status = 'inactive';
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  connect() {
    console.log(`[${this.name}] Verbindung zu ${this.wsUrl} wird hergestellt...`);
    
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log(`[${this.name}] WebSocket verbunden`);
      this.status = 'active';
      this.reconnectAttempts = 0;
      this.sendStatus();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (error) {
        console.error(`[${this.name}] Fehler beim Parsen der Nachricht:`, error);
      }
    });

    this.ws.on('close', () => {
      console.log(`[${this.name}] Verbindung geschlossen`);
      this.status = 'inactive';
      this.attemptReconnect();
    });

    this.ws.on('error', (error) => {
      console.error(`[${this.name}] WebSocket Fehler:`, error.message);
      this.status = 'error';
      this.sendStatus();
    });
  }

  handleMessage(message) {
    console.log(`[${this.name}] Nachricht empfangen:`, message.type);

    switch (message.type) {
      case 'task_assign':
        this.handleTaskAssignment(message.task);
        break;
      case 'context_update':
        this.handleContextUpdate(message.context);
        break;
      case 'bot_command':
        this.handleBotCommand(message.command);
        break;
      case 'status_request':
        this.sendStatus();
        break;
      default:
        console.log(`[${this.name}] Unbekannter Nachrichtentyp: ${message.type}`);
    }
  }

  sendStatus() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'bot_status_update',
        bot: this.name,
        status: this.status,
        timestamp: new Date().toISOString()
      }));
    }
  }

  async handleTaskAssignment(task) {
    console.log(`[${this.name}] Aufgabe zugewiesen:`, task.title);
    this.status = 'working';
    this.sendStatus();

    try {
      await this.processTask(task);
      this.status = 'active';
      this.sendStatus();
      this.acknowledgeTask(task.id, 'completed');
    } catch (error) {
      console.error(`[${this.name}] Fehler bei Aufgabenverarbeitung:`, error);
      this.status = 'error';
      this.sendStatus();
      this.acknowledgeTask(task.id, 'failed', error.message);
    }
  }

  async processTask(task) {
    console.log(`[${this.name}] Verarbeite Aufgabe: ${task.title}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { result: 'Task completed' };
  }

  acknowledgeTask(taskId, status, error = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'task_update',
        taskId,
        status,
        error,
        bot: this.name,
        timestamp: new Date().toISOString()
      }));
    }
  }

  handleContextUpdate(context) {
    console.log(`[${this.name}] Kontext aktualisiert:`, context.filename);
    this.status = 'processing';
    this.sendStatus();

    setTimeout(() => {
      this.status = 'active';
      this.sendStatus();
    }, 1000);
  }

  handleBotCommand(command) {
    console.log(`[${this.name}] Befehl empfangen:`, command.action);

    switch (command.action) {
      case 'restart':
        console.log(`[${this.name}] Bot wird neu gestartet`);
        this.ws.close();
        setTimeout(() => this.connect(), 2000);
        break;
      case 'pause':
        console.log(`[${this.name}] Bot pausiert`);
        this.status = 'paused';
        this.sendStatus();
        break;
      case 'resume':
        console.log(`[${this.name}] Bot fortgesetzt`);
        this.status = 'active';
        this.sendStatus();
        break;
      default:
        console.log(`[${this.name}] Unbekannter Befehl: ${command.action}`);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[${this.name}] Verbindungsversuch ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval / 1000}s...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error(`[${this.name}] Maximale Verbindungsversuche erreicht. Bot wird beendet.`);
    }
  }

  async createTask(title, description = '') {
    try {
      const response = await axios.post(`${this.apiUrl}/api/projects`, {
        title,
        description,
        status: 'todo'
      });
      console.log(`[${this.name}] Aufgabe erstellt:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[${this.name}] Fehler beim Erstellen der Aufgabe:`, error.message);
      return null;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    console.log(`[${this.name}] Bot getrennt`);
  }
}

module.exports = OpenClawBot;