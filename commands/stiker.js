module.exports = {
  name: 'sticker',
  description: 'Ubah gambar jadi stiker',
  async execute(client, message) {
    if (!message.hasMedia) {
      return client.sendMessage(message.from, '❗ Balas gambar dengan .sticker');
    }

    const media = await message.downloadMedia();
    await client.sendMessage(message.from, media, { sendMediaAsSticker: true });
  }
};
