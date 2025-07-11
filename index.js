require('dotenv').config();
const express = require('express');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');
const messageHandler = require('./handlers/messageHandler');

let latestQR = ''; // Menyimpan QR base64

console.log('🟢 Memulai Zayla-Bot...');

const app = express();

app.get('/', (req, res) => {
  res.send('✅ Zayla-Bot is running (Baileys v1.1.0)');
});

app.get('/qr', (req, res) => {
  if (!latestQR) {
    return res.send('⏳ QR belum tersedia. Tunggu sebentar...');
  }

  res.send(`
    <html>
      <head><title>Scan QR - Zayla-Bot</title></head>
      <body style="text-align:center; font-family:sans-serif;">
        <h2>🔐 Scan QR untuk login ke Zayla-Bot</h2>
        <img src="${latestQR}" alt="QR Code" style="margin:20px;" />
        <p>Gunakan WhatsApp kamu dan scan seperti WhatsApp Web.</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server aktif di port ${PORT}`);
});

const startBot = async () => {
  try {
    console.log('🔧 Inisialisasi Baileys...');
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false // QR hanya di web
    });

    console.log('✅ Socket WA berhasil dibuat');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('📡 QR diterima, generate QR untuk halaman web...');
        QRCode.toDataURL(qr, (err, url) => {
          if (err) {
            console.error('❌ Gagal generate QR:', err);
          } else {
            latestQR = url;
            console.log('✅ QR siap di-scan di /qr');
          }
        });
      }

      if (connection === 'open') {
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
