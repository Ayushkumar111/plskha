const express = require('express');
const router = express.Router();
const { 
  addEmergencyContact, 
  getEmergencyContacts, 
  notifyEmergencyContacts,
  addEmergencyContactValidation 
} = require('../Controllers/emergency.Controller');
const { protect } = require('../Middleware/auth');

router.post('/add', protect, addEmergencyContactValidation, addEmergencyContact);
router.get('/:userId', protect, getEmergencyContacts);
router.post('/notify', notifyEmergencyContacts);

module.exports = router;