require('dotenv').config();
const express = require('express');
const QRCode = require('qrcode'); // pakai qrcode (bukan qrcode-terminal)
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');
const messageHandler = require('./handlers/messageHandler');

let latestQR = ''; // Simpan QR untuk ditampilkan di web

// Inisialisasi Express
const app = express();

app.get('/', (req, res) => {
  res.send('✅ Zayla-Bot is running using Baileys');
});

app.get('/qr', (req, res) => {
  if (!latestQR) {
    return res.send('⏳ QR belum tersedia. Tunggu beberapa detik...');
  }

  res.send(`
    <html>
      <head><title>Scan QR - Zayla-Bot</title></head>
      <body style="text-align: center; font-family: sans-serif; background: #f2f2f2;">
        <h2>🤖 Scan QR untuk login ke Zayla-Bot</h2>
        <img src="${latestQR}" alt="QR Code" />
        <p>Gunakan kamera WhatsApp kamu seperti login WhatsApp Web</p>
      </body>
    </html>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web server aktif');
});

// Mulai Bot WhatsApp
const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // tetap tampil di logs
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('🔐 QR tersedia, scan di log atau buka /qr di web');

      // Simpan QR ke base64 untuk ditampilkan di web
      QRCode.toDataURL(qr, (err, url) => {
        if (err) return console.error('❌ Gagal membuat QR:', err);
        latestQR = url;
      });
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error).output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Koneksi terputus. Reconnect?', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ Zayla-Bot v1.1.0 aktif! (Powered by ZAI Lab)');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const message = {
      body,
      from,
      key: msg.key,
      type: msg.message,
      reply: (text) => sock.sendMessage(from, { text }),
    };

    monitorHandler(sock, message);
    messageHandler(sock, message);
    await commandHandler(sock, message);
  });
};

startBot();
