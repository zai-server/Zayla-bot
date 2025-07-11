const userService = require('../services/userService');

module.exports = {
  name: 'admin',
  description: 'Fitur admin',
  adminOnly: true,
  async execute(client, message, arg) {
    const [command, nomor] = arg.split(' ');
    const target = `${nomor}@c.us`;

    if (command === 'makeadmin') {
      userService.makeAdmin(target);
      client.sendMessage(message.from, `✅ ${nomor} kini admin.`);
    } else {
      client.sendMessage(message.from, '❗ Format: .admin makeadmin 628xxxx');
    }
  }
};
