module.exports = {
  name: 'sewa',
  description: 'Sewa akses bot',
  async execute(client, message, arg) {
    const price = {
      '1d': 50,
      '1w': 200,
      '1m': 500
    };

    if (!arg || !price[arg]) {
      return client.sendMessage(message.from, '❗ Format: .sewa [1d|1w|1m]');
    }

    client.sendMessage(message.from, `✅ Bot disewa selama ${arg}.`);
  }
};
