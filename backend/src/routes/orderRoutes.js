const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  clearAllOrders,
} = require('../controllers/orderController');
const { getInvoice, getInvoiceHtml, getInvoicePdf } = require('../controllers/invoiceController');
const { protectCustomer, protectOwner, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectCustomer, getOrders)
  .post(protectCustomer, createOrder);

// Dedicated route for owner operations portal (strictly requires owner role and returns all orders)
router.route('/owner/all')
  .get(protectOwner, getOrders);

// Dedicated route for clearing all operational data (strictly requires owner role)
router.route('/owner/clear-all')
  .delete(protectOwner, clearAllOrders)
  .post(protectOwner, clearAllOrders);

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
