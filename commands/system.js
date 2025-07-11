module.exports = {
  name: 'system',
  description: 'Tampilkan info sistem bot',
  async execute(client, message) {
    const status = `
🛠️ Zayla-Bot System Info
🔹 Versi: 1.1.0
🔹 Powered by ZAI Lab
🔹 Dibuat dengan Hati yang terluka 💔
🔹 Status: Online ✅
    `;
    client.sendMessage(message.from, status);
  }
};
