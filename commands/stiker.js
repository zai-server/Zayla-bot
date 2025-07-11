module.exports = {
  async createStickerFromMedia(client, message) {
    if (!message.hasMedia) {
      return client.sendMessage(message.from, '❗ Balas gambar dengan perintah .sticker');
    }

    const media = await message.downloadMedia();
    await client.sendMessage(message.from, media, { sendMediaAsSticker: true });
  }
};
