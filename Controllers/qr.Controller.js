// controllers/qrController.js
const QRCode = require('../modals/Qr.Code');
const User = require('../modals/User');
const MedicalRecord = require('../modals/Medical.Record');
const EmergencyContact = require('../modals/Emergency.Contact');
const qrcode = require('qrcode');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

// Validation rules
exports.generateQRValidation = [
  check('userId', 'User ID is required').not().isEmpty(),
  validateRequest
];


//   POST /api/qr/generate , for generating qr code for the user 

exports.generateQR = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Chcking if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Chvking  if user is authorized to generate QR for this user
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to generate QR for this user' });
    }

    // Chvking if QR code already exists for this user
    let qrCodeDoc = await QRCode.findOne({ user: userId });

    if (qrCodeDoc) {
      // If QR code exists but is inactive, update it
      if (!qrCodeDoc.isActive) {
        qrCodeDoc.isActive = true;
        qrCodeDoc.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
        await qrCodeDoc.save();
      }
    } else {
      // Generate QR code data
      const qrCodeData = `${process.env.FRONTEND_URL}/scan/${userId}`;
      
      // Generate QR code image
      const qrCodeImage = await qrcode.toDataURL(qrCodeData);
      
      // Create new QR code document
      qrCodeDoc = await QRCode.create({
        user: userId,
        qrCodeData,
        qrCodeImage
      });
    }

    res.status(200).json({
      success: true,
      data: qrCodeDoc
    });
  } catch (err) {
    next(err);
  }
};


//    GET /api/qr/scan/:userId for scanning the qr code

exports.scanQR = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Chking  if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Chking  if QR code exists for this user
    const qrCode = await QRCode.findOne({ user: userId });
    if (!qrCode || !qrCode.isActive) {
      return res.status(404).json({ success: false, error: 'Valid QR code not found for this user' });
    }

    // Chcking  if QR code has expired
    if (qrCode.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, error: 'QR code has expired' });
    }

    // Get user's emergency contacts
    const emergencyContacts = await EmergencyContact.find({ user: userId });

    // Get user's critical medical information
    const userData = {
      name: user.name,
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      chronicConditions: user.chronicConditions,
      currentMedications: user.currentMedications,
      emergencyContacts
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (err) {
    next(err);
  }
};