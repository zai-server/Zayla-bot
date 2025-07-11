const allowedUsers = [];

module.exports = {
  isAuthorized(id) {
    return allowedUsers.includes(id);
  },
  addUser(id) {
    if (!allowedUsers.includes(id)) {
      allowedUsers.push(id);
    }
  }
};
