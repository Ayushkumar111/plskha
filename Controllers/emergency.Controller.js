const EmergencyContact = require('../modal/Emergency.Contact');
const User = require('../modal/user.model');
const { sendEmail, sendSMS } = require('../utils/notification'); // to be made 
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator'); // to be made in uiltiiese folder 

// Validation rules
exports.addEmergencyContactValidation = [
  check('user', 'User ID is required').not().isEmpty(),
  check('name', 'Name is required').not().isEmpty(),
  check('relationship', 'Relationship is required').not().isEmpty(),
  check('phone', 'Phone number is required').not().isEmpty(),
  validateRequest
];


//    POST /api/emergency/add , to add emergency contact 

exports.addEmergencyContact = async (req, res, next) => {
  try {
    const { user, name, relationship, phone, email, isDefault } = req.body;

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is authorized to add emergency contacts for this user
    if (req.user.id !== user && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to add emergency contacts for this user' });
    }

    // Create emergency contact
    const emergencyContact = await EmergencyContact.create({
      user,
      name,
      relationship,
      phone,
      email,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      data: emergencyContact
    });
  } catch (err) {
    next(err);
  }
};

//   GET /api/emergency/:userId , fetch all the emergency contact of users 

exports.getEmergencyContacts = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is authorized to view emergency contacts for this user
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view emergency contacts for this user' });
    }

    // Get all emergency contacts for this user
    const emergencyContacts = await EmergencyContact.find({ user: userId }).sort({ isDefault: -1 });

    res.status(200).json({
      success: true,
      count: emergencyContacts.length,
      data: emergencyContacts
    });
  } catch (err) {
    next(err);
  }
};


//   POST /api/emergency/notify , to notify the emergency contact

exports.notifyEmergencyContacts = async (req, res, next) => {
  try {
    const { userId, message, location } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get all emergency contacts for this user
    const emergencyContacts = await EmergencyContact.find({ user: userId });

    if (emergencyContacts.length === 0) {
      return res.status(404).json({ success: false, error: 'No emergency contacts found for this user' });
    }

    const userName = user.name;
    const standardMessage = message || 
      `EMERGENCY ALERT: ${userName} is having a medical emergency. Medical information can be accessed via MediSync.`;
    
    const locationInfo = location ? `\nLocation: ${location}` : '';
    const fullMessage = `${standardMessage}${locationInfo}`;

    // Notify all emergency contacts
    const notificationPromises = emergencyContacts.map(async (contact) => {
      // Send SMS
      if (contact.phone) {
        await sendSMS(contact.phone, fullMessage);
      }
      
      // Send email
      if (contact.email) {
        const emailSubject = `EMERGENCY ALERT: ${userName}`;
        const emailBody = `
          ${fullMessage}
          
          Medical Profile:
          Name: ${user.name}
          Blood Group: ${user.bloodGroup}
          Allergies: ${user.allergies.join(', ')}
          Chronic Conditions: ${user.chronicConditions.join(', ')}
          Current Medications: ${user.currentMedications.join(', ')}
          
          This is an automated message from MediSync Medical Emergency System.
        `;
        
        await sendEmail(contact.email, emailSubject, emailBody);
      }
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      message: 'Emergency contacts notified successfully'
    });
  } catch (err) {
    next(err);
  }
};