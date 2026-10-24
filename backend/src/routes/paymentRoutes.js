const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure,
  handleWebhook,
} = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/create-order', optionalAuth, createPaymentOrder);
router.post('/verify', optionalAuth, verifyPayment);
router.post('/fail', optionalAuth, recordPaymentFailure);
router.post('/webhook', handleWebhook);

module.exports = router;
