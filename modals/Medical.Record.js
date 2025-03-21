const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicalRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String },
  medication: [String],
  doctorName: { type: String },
  hospitalName: { type: String },
  visitDate: { type: Date, default: Date.now },
  fileUrls: [String], // array to pointing towards uploaded file on cloudinary 
  notes: { type: String }
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
