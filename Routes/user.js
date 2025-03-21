const express = require('express');
const router = express.Router();
const { 
  getUserById, 
  updateUser,
  updateUserValidation 
} = require('../Controllers/user.Controller');
const { protect } = require('../Middleware/auth');

router.get('/:userId', protect, getUserById);
router.put('/:userId', protect, updateUserValidation, updateUser);

module.exports = router;