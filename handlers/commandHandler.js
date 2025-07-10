const fs = require('fs');
const path = require('path');

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
  if (!cmd) return client.sendMessage(message.from, `Perintah .${cmdName} tidak tersedia.`);

  try {
    await cmd.execute(client, message, arg);
  } catch (err) {
    console.error(err);
    client.sendMessage(message.from, `⚠️ Gagal menjalankan perintah .${cmdName}`);
  }
};
