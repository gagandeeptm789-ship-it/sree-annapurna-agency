const express = require('express');
const router = express.Router();
const { getInvoice, getInvoiceHtml, getInvoicePdf, generatePdfDirect } = require('../controllers/invoiceController');
const { optionalAuth, protectOwner } = require('../middleware/authMiddleware');

router.post('/generate-pdf', protectOwner, generatePdfDirect);
router.get('/:id', optionalAuth, getInvoice);
router.get('/:id/pdf', optionalAuth, getInvoicePdf);
router.get('/:id/html', optionalAuth, getInvoiceHtml);

module.exports = router;
