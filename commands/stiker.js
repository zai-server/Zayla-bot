const stickerService = require('../services/stickerService');

module.exports = {
  name: 'stiker',
  description: 'Buat stiker dari gambar',
  async execute(client, message) {
    await stickerService.createStickerFromMedia(client, message);
  }
};
