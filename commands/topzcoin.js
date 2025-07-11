const userService = require('../services/userService');

module.exports = {
  name: 'topzcoin',
  description: 'Lihat ranking zcoin pengguna',
  premium: true,
  async execute(client, message) {
    const top = userService.getTopZcoin(5);
    if (!top.length) return client.sendMessage(message.from, 'Belum ada pengguna.');

    const list = top.map((u, i) => `#${i + 1} ${u.id} — ${u.zcoin} zcoin`).join('\n');
    client.sendMessage(message.from, `🏆 Top 5 Zcoin Users:\n\n${list}`);
  }
};
