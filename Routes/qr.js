const express = require('express');
const router = express.Router();
const { 
  generateQR, 
  scanQR,
  generateQRValidation 
} = require('../Controllers/qr.Controller');
const { protect } = require('../Middleware/auth');

router.post('/generate', protect, generateQRValidation, generateQR);
router.get('/scan/:userId', scanQR);

module.exports = router;