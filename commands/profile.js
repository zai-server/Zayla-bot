const userService = require('../services/userService');

module.exports = {
  name: 'profile',
  description: 'Tampilkan profil user',
  async execute(client, message) {
    const user = userService.getOrCreateUser(message.from);
    const text = `
🧑 *Profil Kamu*
ID: ${message.from}
Zcoin: ${user.zcoin}
Poin Quiz: ${user.quizPoints}
    `;
    client.sendMessage(message.from, text);
  }
};
