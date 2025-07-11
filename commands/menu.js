module.exports = {
  name: 'menu',
  description: 'Tampilkan menu utama',
  async execute(client, message) {
    const text = `
📜 *Zayla‑Bot Menu* v1.1.0 (ZAI Lab)
Perintah tersedia:

.menu | .profile | .sewa
.downloader [url]
.sticker (reply gambar)
.games | .quiz [mapel]
.transfer [nomor] [jumlah] - Kirim zcoin ke pengguna lain  
.topzcoin - Ranking 5 pengguna zcoin tertinggi
Mapel: matematika, fisika, bahasa
Zcoin = mata uang virtual
    `;
    client.sendMessage(message.from, text);
  }
};
