const bannedWords = ['bir', 'alkohol', 'beer'];

module.exports = (client, message) => {
  if (!message.from.includes('@g.us')) return;
  const content = message.body.toLowerCase();

  for (let word of bannedWords) {
    if (content.includes(word)) {
      client.sendMessage(message.from, `🚫 Kata terlarang terdeteksi: *${word}*`);
      break;
    }
  }
};
