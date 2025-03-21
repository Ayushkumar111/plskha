const MedicalRecord = require('../modals/Medical.Record');
const User = require('../modals/user.model');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

// Validation rules
exports.addMedicalRecordValidation = [
  check('user', 'User ID is required').not().isEmpty(),
  check('recordType', 'Record type is required').not().isEmpty(),
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('doctor.name', 'Doctor name is required').not().isEmpty(),
  validateRequest
];

// POST /api/medical/add   add medical data

exports.addMedicalRecord = async (req, res, next) => {
  try {
    const { user, recordType, title, description, date, doctor, attachments } = req.body;

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is authorized to add medical records for this user
    if (req.user.id !== user && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to add medical records for this user' });
    }

    // Create medical record
    const medicalRecord = await MedicalRecord.create({
      user,
      recordType,
      title,
      description,
      date,
      doctor,
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      data: medicalRecord
    });
  } catch (err) {
    next(err);
  }
};


//    GET /api/medical/:userId , for getting the medical data of the user

exports.getMedicalRecords = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is authorized to view medical records for this user
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view medical records for this user' });
    }

    // Get all medical records for this user
    const medicalRecords = await MedicalRecord.find({ user: userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: medicalRecords.length,
      data: medicalRecords
    });
  } catch (err) {
    next(err);
  }
};


//   PUT /api/medical/:recordId for updating medical records of  a user

exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const recordId = req.params.recordId;

    // Check if medical record exists
    let medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
      return res.status(404).json({ success: false, error: 'Medical record not found' });
    }

    // Check if user is authorized to update this medical record
    if (req.user.id !== medicalRecord.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this medical record' });
    }

    // Fields to update
    const fieldsToUpdate = {
      recordType: req.body.recordType,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      doctor: req.body.doctor,
      attachments: req.body.attachments
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Update medical record
    medicalRecord = await MedicalRecord.findByIdAndUpdate(recordId, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: medicalRecord
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteMedicalRecord = async (req, res, next) => {
    try {
      const recordId = req.params.recordId;
  
      // Check if medical record exists
      const medicalRecord = await MedicalRecord.findById(recordId);
      if (!medicalRecord) {
        return res.status(404).json({ success: false, error: 'Medical record not found' });
      }
  
      // Check if user is authorized to delete this medical record
      if (req.user.id !== medicalRecord.user.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this medical record' });
      }
  
      // Delete medical record
      await medicalRecord.remove();
  
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (err) {
      next(err);
    }
  };