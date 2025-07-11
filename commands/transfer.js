const userService = require('../services/userService');

module.exports = {
  name: 'transfer',
  description: 'Transfer zcoin ke pengguna lain',
  async execute(client, message, arg) {
    const [targetRaw, amountRaw] = arg.split(' ');

    if (!targetRaw || !amountRaw || isNaN(amountRaw)) {
      return client.sendMessage(message.from, '❗ Format: .transfer 628xxxxxx 50');
    }

    const amount = parseInt(amountRaw);
    const targetId = `${targetRaw}@c.us`;

    if (targetId === message.from) {
      return client.sendMessage(message.from, '❌ Tidak bisa transfer ke diri sendiri.');
    }

    const success = userService.deductZcoin(message.from, amount);
    if (!success) {
      return client.sendMessage(message.from, '❌ Saldo zcoin kamu tidak cukup.');
    }

    userService.addZcoin(targetId, amount);
    client.sendMessage(message.from, `✅ Berhasil transfer ${amount} zcoin ke ${targetRaw}`);
    client.sendMessage(targetId, `🎁 Kamu menerima ${amount} zcoin dari ${message.from}`);
  }
};
