module.exports = {
  name: 'games',
  description: 'Tebak angka 1-10',
  async execute(client, message) {
    const number = Math.floor(Math.random() * 10) + 1;
    client.sendMessage(message.from, '🎲 Aku pilih angka 1-10. Tebak!');

    const filter = m => m.from === message.from;
    client.once('message', (reply) => {
      if (reply.body === number.toString()) {
        client.sendMessage(reply.from, `🎉 Benar! Angka: ${number}`);
      } else {
        client.sendMessage(reply.from, `❌ Salah. Angka: ${number}`);
      }
    });
  }
};
