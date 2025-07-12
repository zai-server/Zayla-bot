// Log awal untuk deteksi crash awal
console.log('✅ index.js dimulai');

// Nonaktifkan log bawaan Baileys agar tidak terlalu ramai
process.env.BAILEYS_LOG_LEVEL = 'silent';

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// Safe fallback jika file handler belum ada
let commandHandler = () => {};
let monitorHandler = () => {};
let messageHandler = () => {};

try {
  commandHandler = require('./handlers/commandHandler');
  monitorHandler = require('./handlers/monitorHandler');
  messageHandler = require('./handlers/messageHandler');
} catch (err) {
  console.log('⚠️ Beberapa handler belum tersedia, menggunakan default kosong.');
}

// Pastikan folder auth tersedia
if (!fs.existsSync('auth')) {
  fs.mkdirSync('auth');
  console.log('📂 Folder auth/ dibuat');
}

let latestQR = '';
let isLoggedIn = false;

const app = express();

app.get('/', (_, res) => {
  res.send('✅ Zayla-Bot aktif di Baileys v1.1.0');
});

app.get('/qr', (_, res) => {
  if (isLoggedIn) {
    return res.send('<h2>✅ Bot sudah login ke WhatsApp</h2>');
  }
  if (!latestQR) {
    return res.send('<h2>⏳ QR belum tersedia. Tunggu dan refresh halaman.</h2>');
  }
  res.send(`<img src="${latestQR}" style="width:300px; height:300px;" />`);
});

const PORT = process.env.PORT || 3000;
try {
  app.listen(PORT, () => {
    console.log(`🌐 Web server aktif di port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Gagal menjalankan web server:', err);
}

setInterval(() => {
  console.log('🕓 Bot masih aktif...');
}, 60000);

const startBot = async () => {
  console.log('🔧 Menjalankan startBot()...');
  try {
    console.log('🗝️  Mengambil session dari folder auth...');
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    console.log('✅ Session berhasil dimuat. Membuat koneksi...');

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
          console.log('📡 QR baru diterima. Akses di /qr');
        } catch (err) {
          console.error('❌ Gagal membuat QR:', err);
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
    console.error('❌ startBot() error:', err);
  }
};

try {
  startBot();
} catch (err) {
  console.error('❌ startBot() crash tidak tertangkap:', err);
      }
