const OpenClawBot = require('./OpenClawBot');

const botConfig = {
  name: 'OpenClaw Bot',
  wsUrl: process.env.WS_URL || 'ws://localhost:3002',
  apiUrl: process.env.API_URL || 'http://localhost:3002'
};

const bot = new OpenClawBot(botConfig);

bot.connect();

process.on('SIGINT', () => {
  console.log('\n[Bot] Herunterfahren...');
  bot.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Bot] Herunterfahren...');
  bot.disconnect();
  process.exit(0);
});

setInterval(() => {
  bot.sendStatus();
}, 30000);