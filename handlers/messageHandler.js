module.exports = (client, message) => {
  if (message.body.toLowerCase().includes('zayla')) {
    client.sendMessage(message.from, '👋 Ya, ada yang bisa Zayla bantu? Ketik .menu untuk perintah.');
  }
};
