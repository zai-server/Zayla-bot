const soal = {
  matematika: [
    { q: '5 + 3 = ?', a: '8' },
    { q: '10 ÷ 2 = ?', a: '5' }
  ],
  fisika: [
    { q: 'Simbol gaya adalah?', a: 'F' }
  ],
  bahasa: [
    { q: 'Sinonim “cantik”?', a: 'indah' }
  ]
};

module.exports = {
  getQuestion(mapel) {
    const list = soal[mapel];
    if (!list) return null;
    return list[Math.floor(Math.random() * list.length)];
  }
};
