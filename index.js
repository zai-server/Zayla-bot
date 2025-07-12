// Log awal agar tahu proses tidak crash
console.log('✅ index.js loaded awal');

// Pastikan env, modul, dan log Baileys tidak menyebabkan crash
process.env.BAILEYS_LOG_LEVEL = 'silent';

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// ❗ Safe fallback jika file handler belum dibuat
const commandHandler = require('./handlers/commandHandler') || (() => {});
const monitorHandler = require('./handlers/monitorHandler') || (() => {});
const messageHandler = require('./handlers/messageHandler') || (() => {});

// Pastikan folder auth/ ada agar Baileys tidak error
if (!fs.existsSync('auth')) {
  fs.mkdirSync('auth');
  console.log('📂 Folder auth dibuat');
}

let latestQR = '';
let isLoggedIn = false;

const app = express();

app.get('/', (_, res) => {
  res.send('✅ Zayla-Bot is running on Baileys v1.1.0');
});

app.get('/qr', (_, res) => {
  if (isLoggedIn) {
    return res.send('<h2>✅ Bot sudah login ke WhatsApp</h2>');
  }
  if (!latestQR) {
    return res.send('<h2>⏳ QR belum siap. Refresh halaman ini dalam 5 detik.</h2>');
  }
  res.send(`<img src="${latestQR}" style="width:300px;" />`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server aktif di port ${PORT}`);
});

setInterval(() => console.log('🕓 Zayla-Bot masih hidup...'), 60000);

const startBot = async () => {
  console.log('🔧 Menjalankan startBot()...');

  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    console.log('✅ Socket WA aktif');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          latestQR = await QRCode.toDataURL(qr);
          isLoggedIn = false;
          console.log('📡 QR baru diterima. Scan di /qr');
        } catch (err) {
          console.error('❌ Gagal generate QR:', err);
        }
      }

      if (connection === 'open') {
        isLoggedIn = true;
        console.log('✅ Bot berhasil login ke WhatsApp');
      }

      if (connection === 'close') {
        const statusCode = new Boom(lastDisconnect?.error).output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`⚠️ Koneksi WA ditutup. Reconnect? ${shouldReconnect}`);
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
    console.error('❌ startBot() gagal:', err);
  }
};

startBot();
