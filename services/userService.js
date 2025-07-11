const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '../data/users.json');
let users = {};

if (fs.existsSync(dataFile)) {
  users = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} else {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

const now = () => Date.now();

module.exports = {
  getOrCreateUser(id) {
    if (!users[id]) {
      users[id] = {
        zcoin: 100,
        quizPoints: 0,
        premiumUntil: 0,
        isAdmin: false
      };
      saveData();
    }
    return users[id];
  },
  addZcoin(id, amount) {
    const user = this.getOrCreateUser(id);
    user.zcoin += amount;
    saveData();
  },
  deductZcoin(id, amount) {
    const user = this.getOrCreateUser(id);
    if (user.zcoin >= amount) {
      user.zcoin -= amount;
      saveData();
      return true;
    }
    return false;
  },
  addQuizPoint(id, points) {
    const user = this.getOrCreateUser(id);
    user.quizPoints += points;
    saveData();
  },
  getTopZcoin(limit = 5) {
    return Object.entries(users)
      .map(([id, data]) => ({ id, zcoin: data.zcoin }))
      .sort((a, b) => b.zcoin - a.zcoin)
      .slice(0, limit);
  },
  setPremium(id, durationMs) {
    const u = this.getOrCreateUser(id);
    u.premiumUntil = Math.max(u.premiumUntil, now()) + durationMs;
    saveData();
  },
  isPremium(id) {
    const u = this.getOrCreateUser(id);
    return u.premiumUntil > now();
  },
  makeAdmin(id) {
    const u = this.getOrCreateUser(id);
    u.isAdmin = true;
    saveData();
  },
  isAdmin(id) {
    const u = this.getOrCreateUser(id);
    return u.isAdmin === true;
  }
};
