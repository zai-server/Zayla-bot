module.exports = {
  name: 'monitor',
  description: 'Aktifkan mode pengawasan kata terlarang',
  async execute(client, message) {
    // Untuk demo: aktifkan notifikasi ketika pengguna mengetik .monitor
    client.sendMessage(message.from, '👁️ Pengawasan aktif. Semua kata terlarang akan dipantau.');
  }
};
