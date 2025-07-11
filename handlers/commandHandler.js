const fs = require('fs');
const path = require('path');
const userService = require('../services/userService');

// Auto-load semua perintah
const commands = {};
fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const cmd = require(`../commands/${file}`);
    commands[cmd.name] = cmd;
  });

module.exports = async (client, message) => {
  if (!message.body.startsWith('.')) return;

  const [cmdNameRaw, ...args] = message.body.slice(1).trim().split(' ');
  const cmdName = cmdNameRaw.toLowerCase();
  const arg = args.join(' ');

  const cmd = commands[cmdName];
  if (!cmd) {
    return client.sendMessage(message.from, `❌ Perintah .${cmdName} tidak ditemukan.`);
  }

  // 🛠️ Validasi premium dan admin
  if (cmd.premium && !userService.isPremium(message.from)) {
    return client.sendMessage(message.from, '⚠️ Fitur ini hanya untuk pengguna premium.');
  }

  if (cmd.adminOnly && !userService.isAdmin(message.from)) {
    return client.sendMessage(message.from, '⛔ Hanya admin yang bisa menggunakan perintah ini.');
  }

  try {
    await cmd.execute(client, message, arg);
  } catch (err) {
    console.error(err);
    client.sendMessage(message.from, `❗ Error saat menjalankan .${cmdName}`);
  }
};
