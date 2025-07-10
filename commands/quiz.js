const quizService = require('../services/quizService');

module.exports = {
  name: 'quiz',
  description: 'Kuis berdasarkan mapel',
  async execute(client, message, arg) {
    const q = quizService.getQuestion(arg || 'matematika');
    if (!q) return client.sendMessage(message.from, '❗ Mapel tidak tersedia.');

    client.sendMessage(message.from, `🧠 ${q.q}`);
    client.once('message', reply => {
      if (reply.body.trim().toLowerCase() === q.a.toLowerCase()) {
        client.sendMessage(reply.from, '✅ Benar!');
      } else {
        client.sendMessage(reply.from, `❌ Salah. Jawaban: ${q.a}`);
      }
    });
  }
};
