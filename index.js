require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');

const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');
const messageHandler = require('./handlers/messageHandler');

const app = express();

// Inisialisasi WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "zayla-bot" }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code muncul di console Zeabur log
client.on('qr', qr => {
  const qrcode = require('qrcode-terminal');
  console.log('🔐 Silakan scan QR untuk login Zayla‑Bot:');
  qrcode.generate(qr, { small: true });
});

// Setelah login sukses
client.on('ready', () => {
  console.log('✅ Zayla‑Bot v1.1.0 aktif dan siap digunakan! (Powered by ZAI Lab)');
});

// Saat menerima pesan baru
client.on('message', async message => {
  monitorHandler(client, message);
  messageHandler(client, message);
  await commandHandler(client, message);
});

// Jalankan client WhatsApp
client.initialize();

// Web server untuk status
app.get('/', (req, res) => {
  res.send('Zayla‑Bot v1.1.0 is running — Powered by ZAI Lab');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server aktif di port ${PORT}`);
});
