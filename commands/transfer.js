const userService = require('../services/userService');

module.exports = {
  name: 'transfer',
  description: 'Transfer zcoin ke pengguna lain',
  async execute(client, message, arg) {
    const [targetRaw, amountRaw] = arg.split(' ');
    const amount = parseInt(amountRaw);
    const targetId = `${targetRaw}@c.us`;

    if (!targetRaw || !amountRaw || isNaN(amount)) {
      return client.sendMessage(message.from, '❗ Format: .transfer 628xxxx 50');
    }

    if (targetId === message.from) {
      return client.sendMessage(message.from, '❌ Tidak bisa transfer ke diri sendiri.');
    }

    if (!userService.deductZcoin(message.from, amount)) {
      return client.sendMessage(message.from, '❌ Saldo zcoin kamu tidak cukup.');
    }

    userService.addZcoin(targetId, amount);
    client.sendMessage(message.from, `✅ Transfer ${amount} zcoin ke ${targetRaw} berhasil.`);
    client.sendMessage(targetId, `🎁 Kamu menerima ${amount} zcoin dari ${message.from}`);
  }
};
