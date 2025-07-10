const users = {};

module.exports = {
  getOrCreateUser(id) {
    if (!users[id]) {
      users[id] = { zcoin: 100, quizPoints: 0 };
    }
    return users[id];
  },
  addZcoin(id, amount) {
    this.getOrCreateUser(id).zcoin += amount;
  },
  addQuizPoint(id, points) {
    this.getOrCreateUser(id).quizPoints += points;
  }
};
