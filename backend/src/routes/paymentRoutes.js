const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure,
  handleWebhook,
  submitUpiPayment,
  verifyUpiPayment,
} = require('../controllers/paymentController');
const { optionalAuth, protectOwner } = require('../middleware/authMiddleware');

router.post('/create-order', optionalAuth, createPaymentOrder);
router.post('/verify', optionalAuth, verifyPayment);
router.post('/fail', optionalAuth, recordPaymentFailure);
router.post('/submit-utr', optionalAuth, submitUpiPayment);
router.post('/verify-upi', protectOwner, verifyUpiPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
