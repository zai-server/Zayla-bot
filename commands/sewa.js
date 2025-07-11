const userService = require('../services/userService');

module.exports = {
  name: 'sewa',
  description: 'Sewa akses premium bot',
  async execute(client, message, arg) {
    const durations = { '1d': 86400000, '1w': 604800000, '1m': 2592000000 };
    const prices = { '1d': 50, '1w': 200, '1m': 500 };
    const durMs = durations[arg], price = prices[arg];

    if (!durMs) {
      return client.sendMessage(message.from, '❗ Format: .sewa 1d | 1w | 1m');
    }

    if (!userService.deductZcoin(message.from, price)) {
      return client.sendMessage(message.from, '❌ Saldo zcoin tidak cukup.');
    }

    userService.setPremium(message.from, durMs);
    client.sendMessage(message.from, `✅ Premium aktif selama ${arg}`);
  }
};
