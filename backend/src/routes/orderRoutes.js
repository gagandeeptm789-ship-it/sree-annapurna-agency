const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { getInvoice, getInvoiceHtml, getInvoicePdf } = require('../controllers/invoiceController');
const { protectOwner, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getOrders)
  .post(optionalAuth, createOrder);

router.route('/:id')
  .get(optionalAuth, getOrderById);

router.route('/:id/status')
  .patch(protectOwner, updateOrderStatus);

router.route('/:id/invoice')
  .get(optionalAuth, getInvoice);

router.route('/:id/invoice/pdf')
  .get(optionalAuth, getInvoicePdf);

router.route('/:id/invoice/html')
  .get(optionalAuth, getInvoiceHtml);

module.exports = router;
