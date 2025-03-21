const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QRCodeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  qrCodeData: { type: String, required: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRCode', QRCodeSchema);
