require('dotenv').config();
const express = require('express');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');
const messageHandler = require('./handlers/messageHandler');

let latestQR = ''; // Untuk simpan QR dalam bentuk base64 image

const app = express();

app.get('/', (req, res) => {
  res.send('✅ Zayla-Bot is running using Baileys – v1.1.0');
});

app.get('/qr', (req, res) => {
  if (!latestQR) {
    return res.send('⏳ QR belum tersedia. Tunggu beberapa detik...');
  }

  res.send(`
    <html>
      <head><title>Scan QR - Zayla-Bot</title></head>
      <body style="text-align:center; font-family:sans-serif;">
        <h2>🔐 Scan QR untuk login ke Zayla-Bot</h2>
        <img src="${latestQR}" alt="QR Code" style="margin:20px;" />
        <p>Gunakan WhatsApp di HP kamu untuk scan seperti WhatsApp Web.</p>
      </body>
    </html>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  // Tidak perlu console.log agar tidak tampil di runtime log
});

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false // Nonaktifkan QR di terminal
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        QRCode.toDataURL(qr, (err, url) => {
          if (!err) latestQR = url;
        });
      }

      if (connection === 'close') {
        const statusCode = new Boom(lastDisconnect?.error).output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) startBot();
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
  } catch (err) {
    // Tangani error diam-diam
  }
};

startBot();
