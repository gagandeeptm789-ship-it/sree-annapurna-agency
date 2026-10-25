const express = require('express');
const router = express.Router();
const { getInvoice, getInvoiceHtml, getInvoicePdf, generatePdfDirect } = require('../controllers/invoiceController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate-pdf', optionalAuth, generatePdfDirect);
router.get('/:id', optionalAuth, getInvoice);
router.get('/:id/pdf', optionalAuth, getInvoicePdf);
router.get('/:id/html', optionalAuth, getInvoiceHtml);

module.exports = router;
