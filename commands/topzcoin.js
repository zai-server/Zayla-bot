const userService = require('../services/userService');

module.exports = {
  name: 'topzcoin',
  description: 'Lihat ranking pengguna berdasarkan zcoin',
  async execute(client, message) {
    const top = userService.getTopZcoin(5); // ambil 5 besar

    if (top.length === 0) {
      return client.sendMessage(message.from, '❗ Belum ada data pengguna.');
    }

    const list = top.map((u, i) => `#${i + 1} ${u.id} — 💰 ${u.zcoin} zcoin`).join('\n');
    client.sendMessage(message.from, `🏆 Top 5 Zcoin Users:\n\n${list}`);
  }
};
