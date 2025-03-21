const User = require('../modals/user.model');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

// validation rules needed for updating the user 
exports.updateUserValidation = [
  check('name', 'Name is required').optional().not().isEmpty(),
  check('phone', 'Phone number is required').optional().not().isEmpty(),
  check('bloodGroup', 'Valid blood group is required').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  validateRequest
];


// route   GET /api/user/:userId

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is authorized to view this profile
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to access this profile' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};


//   PUT /api/user/:userId  , for updating the user data 

exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // autherisation chck 
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }

    // Fields to be  updated
    const fieldsToUpdate = {          
      name: req.body.name,
      phone: req.body.phone,
      bloodGroup: req.body.bloodGroup,
      allergies: req.body.allergies,
      chronicConditions: req.body.chronicConditions,
      currentMedications: req.body.currentMedications
    };   

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    user = await User.findByIdAndUpdate(req.params.userId, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};