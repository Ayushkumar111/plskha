const express = require('express');
const router = express.Router();
const { 
  addMedicalRecord, 
  getMedicalRecords, 
  updateMedicalRecord, 
  deleteMedicalRecord,
  addMedicalRecordValidation 
} = require('../Controllers/Medical.controller');
const { protect } = require('../Middleware/auth');

router.post('/add', protect, addMedicalRecordValidation, addMedicalRecord);
router.get('/:userId', protect, getMedicalRecords);
router.put('/:recordId', protect, updateMedicalRecord);
router.delete('/:recordId', protect, deleteMedicalRecord);

module.exports = router;