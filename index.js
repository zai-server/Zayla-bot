process.env.BAILEYS_LOG_LEVEL = 'silent'; // matikan logger bawaan Baileys

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// Override logger
require('@whiskeysockets/baileys').DEFAULT_OPTIONS.logger = {
  info: (msg) => console.log(msg),
  warn: (msg) => console.warn(msg),
  error: (msg) => console.error(msg),
  debug: () => {},
}

console.log('🟢 Memulai Zayla-Bot...');

if (!fs.existsSync('auth')) fs.mkdirSync('auth');

let latestQR = '';
let isLoggedIn = false;

const app = express();

app.get('/', (_, res) => res.send('✅ Zayla-Bot is running'));
app.get('/qr', (req, res) => {
  if (isLoggedIn) return res.send('<h2>✅ Bot sudah login</h2>');
  if (!latestQR) return res.send('<h2>⏳ QR belum siap, refresh nanti...</h2>');
  res.send(`<img src="${latestQR}" />`);
});

app.listen(process.env.PORT || 3000, () => console.log('🌐 Server aktif'));

setInterval(() => console.log('🕓 Bot masih hidup'), 60000);

const startBot = async () => {
  console.log('🔧 Memanggil startBot()...');
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    console.log('✅ Socket WA dibuat');

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async u => {
      const { connection, qr } = u;
      if (qr) {
        latestQR = await QRCode.toDataURL(qr);
        isLoggedIn = false;
        console.log('✅ QR siap di /qr');
      }
      if (connection === 'open') {
        isLoggedIn = true;
        console.log('🔓 Bot login berhasil');
      }
      if (connection === 'close') {
        const statusCode = new Boom(u.lastDisconnect?.error).output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log('⚠️ Koneksi terputus. Reconnect?', shouldReconnect);
        if (shouldReconnect) startBot();
      }
    });

    sock.ev.on('messages.upsert', m => {
      console.log('✉️ Pesan masuk', m.messages[0].key.remoteJid);
    });
  } catch (e) {
    console.error('❌ startBot gagal:', e);
  }
};

startBot();
