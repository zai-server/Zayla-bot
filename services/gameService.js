module.exports = {
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  rockPaperScissors(choice) {
    const options = ['batu', 'gunting', 'kertas'];
    const botChoice = options[Math.floor(Math.random() * 3)];

    if (choice === botChoice) return { result: 'seri', botChoice };
    if (
      (choice === 'batu' && botChoice === 'gunting') ||
      (choice === 'gunting' && botChoice === 'kertas') ||
      (choice === 'kertas' && botChoice === 'batu')
    ) {
      return { result: 'menang', botChoice };
    }

    return { result: 'kalah', botChoice };
  }
};
