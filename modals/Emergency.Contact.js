const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmergencyContactSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relationship: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  isNotificationEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
