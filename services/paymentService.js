const userService = require('./userService');

module.exports = {
  chargeUser(id, amount) {
    const user = userService.getOrCreateUser(id);
    if (user.zcoin < amount) {
      return false;
    }
    user.zcoin -= amount;
    return true;
  },
  addFunds(id, amount) {
    userService.addZcoin(id, amount);
  }
};
