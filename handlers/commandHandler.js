const userService = require('../services/userService');

// ... setelah ambil command ...
if (cmd.premium && !userService.isPremium(message.from)) {
  return client.sendMessage(message.from, '⚠️ Fitur ini khusus premium. Ketik .sewa untuk akses.');
}

if (cmd.adminOnly && !userService.isAdmin(message.from)) {
  return client.sendMessage(message.from, '⛔ Kamu bukan admin.');
}
