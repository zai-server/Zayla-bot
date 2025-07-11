const QRCode = require('qrcode');

module.exports = {
  generateQRImage(qr) {
    return QRCode.toDataURL(qr);
  }
};
