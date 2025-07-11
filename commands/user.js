const userService = require('../services/userService');

module.exports = {
  name: 'user',
  description: 'Cek data user lain atau dirimu sendiri',
  async execute(client, message, arg) {
    const target = arg || message.from;
    const user = userService.getOrCreateUser(target);

    const text = `
🧑 *Data User*
🪪 ID: ${target}
💰 Zcoin: ${user.zcoin}
📘 Poin Kuis: ${user.quizPoints}
    `;
    client.sendMessage(message.from, text);
  }
};
