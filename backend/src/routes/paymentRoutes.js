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
const { optionalAuth, protectCustomer, protectOwner } = require('../middleware/authMiddleware');

router.post('/create-order', protectCustomer, createPaymentOrder);
router.post('/verify', protectCustomer, verifyPayment);
router.post('/fail', protectCustomer, recordPaymentFailure);
router.post('/submit-utr', protectCustomer, submitUpiPayment);
router.post('/verify-upi', protectOwner, verifyUpiPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
