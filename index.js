require('dotenv').config();
const fs = require('fs');
const express = require('express');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');
const messageHandler = require('./handlers/messageHandler');

console.log('🟢 Memulai Zayla-Bot...');

// Pastikan folder auth/ ada
if (!fs.existsSync('auth')) {
  console.log('📂 Folder auth/ tidak ditemukan. Membuat...');
  fs.mkdirSync('auth');
}

let latestQR = ''; // base64 QR code
let isLoggedIn = false;

const app = express();

app.get('/', (req, res) => {
  res.send('✅ Zayla-Bot is running (Baileys v1.1.0)');
});

app.get('/qr', (req, res) => {
  if (isLoggedIn) {
    return res.send(`
      <html><body style="text-align:center">
        <h2>✅ Bot sudah login ke WhatsApp</h2>
        <p>Kamu bisa mulai kirim perintah lewat WhatsApp.</p>
      </body></html>
    `);
  }

  if (!latestQR || !latestQR.startsWith('data:image')) {
    return res.send(`
      <html><body style="text-align:center">
        <h2>⏳ QR belum siap</h2>
        <p>Tunggu 1–2 detik dan refresh halaman ini.</p>
      </body></html>
    `);
  }

  res.send(`
    <html>
      <head><title>Scan QR - Zayla-Bot</title></head>
      <body style="text-align:center; font-family:sans-serif;">
        <h2>🔐 Scan QR untuk login ke Zayla-Bot</h2>
        <img src="${latestQR}" alt="QR Code" style="margin:20px;" />
        <p>Gunakan WhatsApp kamu untuk scan QR ini seperti WhatsApp Web.</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server aktif di port ${PORT}`);
});

const startBot = async () => {
  console.log('🔧 Memanggil startBot()...');

  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    console.log('✅ Socket WA berhasil dibuat');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const url = await QRCode.toDataURL(qr);
          latestQR = url;
          isLoggedIn = false;
          console.log('✅ QR baru siap diakses di /qr');
        } catch (err) {
          console.error('❌ Gagal generate QR:', err);
        }
      }

      if (connection === 'open') {
        isLoggedIn = true;
        console.log('🔓 Bot berhasil login ke WhatsApp');
      }

      if (connection === 'close') {
        const statusCode = new Boom(lastDisconnect?.error).output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`⚠️ Koneksi terputus. Reconnect? ${shouldReconnect}`);
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
    console.error('❌ Gagal menjalankan Zayla-Bot:', err);
  }
};

startBot();
