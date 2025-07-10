require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "zayla-bot" }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  console.log('🔐 Scan QR:');
  require('qrcode-terminal').generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Zayla‑Bot v1.1.0 siap! (powered by ZAI Lab)');
});

client.on('message', async message => {
  monitorHandler(client, message);
  await commandHandler(client, message);
});

client.initialize();

const app = express();
app.get('/', (req, res) => res.send('Zayla‑Bot v1.1.0 berjalan (ZAI Lab)'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web server aktif'));
