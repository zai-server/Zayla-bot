const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '../data/users.json');

let users = {};

// Load data saat start
if (fs.existsSync(dataFile)) {
  users = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} else {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

// Simpan data setiap ada perubahan
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

module.exports = {
  getOrCreateUser(id) {
    if (!users[id]) {
      users[id] = { zcoin: 100, quizPoints: 0 };
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
  addQuizPoint(id, points)
    getTopZcoin(limit = 5) {
  const top = Object.entries(users)
    .map(([id, data]) => ({ id, zcoin: data.zcoin }))
    .sort((a, b) => b.zcoin - a.zcoin)
    .slice(0, limit);

  return top;
{
    const user = this.getOrCreateUser(id);
    user.quizPoints += points;
    saveData();
  }
};
