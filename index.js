require('dotenv').config();
const express = require('express');
const qrcode = require('qrcode-terminal');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const commandHandler = require('./handlers/commandHandler');
const monitorHandler = require('./handlers/monitorHandler');
const messageHandler = require('./handlers/messageHandler');

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('🔐 Scan QR berikut untuk login:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Koneksi terputus. Reconnect?', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ Zayla‑Bot v1.1.0 aktif dan siap digunakan!');
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

const app = express();
app.get('/', (req, res) => res.send('Zayla‑Bot is running using Baileys'));
app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web server aktif');
});
