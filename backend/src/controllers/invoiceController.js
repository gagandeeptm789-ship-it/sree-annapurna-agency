const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { generateInvoicePdf } = require('../utils/pdfGenerator');

const ORDERS_STORAGE_PATH = path.resolve(__dirname, '../../data/orders.json');

function loadOrdersFromDisk() {
  try {
    if (fs.existsSync(ORDERS_STORAGE_PATH)) {
      const raw = fs.readFileSync(ORDERS_STORAGE_PATH, 'utf8').trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    }
  } catch (_) {}
  return [];
}

const AGENCY_DETAILS = {
  name: 'SREE ANNAPURNA AGENCY',
  tagline: 'Authorized Wholesale & Regional FMCG Distribution',
  address: 'APMC Market Yard, Shivamogga, Karnataka 577201',
  phone: '+91 94481 23456 / 08182 222333',
  email: 'contact@sreeannapurnaagency.com',
  jurisdiction: 'Shivamogga, Karnataka, India',
};

function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateValue) {
  const d = new Date(dateValue || Date.now());
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Fetch order safely with strict authorization check (Owner, Authenticated Customer owning the order, or matching Guest Token)
async function getAuthorizedOrder(id, reqUser, query = {}, headers = {}) {
  const cleanId = String(id || '').trim();

  let order = null;

  if (mongoose.connection.readyState === 1) {
    const queryFilter = mongoose.isValidObjectId(cleanId)
      ? { $or: [{ orderId: cleanId }, { _id: cleanId }] }
      : { orderId: cleanId };
    order = await Order.findOne(queryFilter).lean();
  } else {
    // Persistent storage fallback
    const diskOrders = loadOrdersFromDisk();
    order = diskOrders.find((o) => o.orderId === cleanId) || null;
  }

  if (!order) return null;

  const isOwner = reqUser && reqUser.role === 'owner';
  const customerUserId = reqUser && reqUser.id ? String(reqUser.id) : null;
  const guestToken = query.token || headers['x-order-token'];

  const isOwnerAuthorized = Boolean(isOwner);
  const isUserIdAuthorized = Boolean(customerUserId && order.user && String(order.user) === customerUserId);
  const isTokenAuthorized = Boolean(
    !reqUser && order.isGuest && guestToken && order.accessToken && guestToken === order.accessToken
  );

  if (!isOwnerAuthorized && !isUserIdAuthorized && !isTokenAuthorized) {
    return 'UNAUTHORIZED';
  }

  return order;
}

// @desc    Generate PDF directly from order data payload
// @route   POST /api/invoices/generate-pdf
exports.generatePdfDirect = async (req, res, next) => {
  try {
    const orderData = req.body.order || req.body;
    if (!orderData || (!orderData.items && !orderData.total)) {
      return res.status(400).json({ success: false, message: 'Invalid order data provided for PDF generation.' });
    }

    const pdfBuffer = generateInvoicePdf(orderData);
    const filename = `Invoice-${orderData.orderId || orderData.id || 'ORDER'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Download authentic PDF invoice
// @route   GET /api/orders/:id/invoice/pdf (or /api/invoices/:id/pdf)
exports.getInvoicePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getAuthorizedOrder(id, req.user, req.query, req.headers);

    if (order === 'UNAUTHORIZED') {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).json({
        success: false,
        message: 'Access denied: You are not authorized to download this invoice.',
      });
    }
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order for this invoice was not found.',
      });
    }

    const pdfBuffer = generateInvoicePdf(order);
    const filename = `Invoice-${order.orderId || order.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get structured invoice JSON data
// @route   GET /api/orders/:id/invoice
exports.getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getAuthorizedOrder(id, req.user, req.query, req.headers);

    if (order === 'UNAUTHORIZED') {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).json({ success: false, message: 'You are not authorized to access this invoice.' });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order for this invoice was not found.' });
    }

    const items = (order.items || []).map((i) => ({
      name: i.name,
      pack: i.pack || '',
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.quantity * i.unitPrice,
    }));

    const invoiceData = {
      invoiceNumber: `INV-${order.orderId}`,
      orderId: order.orderId,
      date: formatDate(order.date),
      agency: AGENCY_DETAILS,
      customer: {
        name: order.customer,
        email: order.customerEmail,
        phone: order.phone,
        deliveryAddress: order.deliveryDetails,
      },
      items,
      subtotal: order.total,
      deliveryFee: 0,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment,
      paymentMethod: order.paymentMethod || 'Cash on Delivery / Authorized Agency Invoice',
      notes: order.deliveryDetails?.notes || 'Authorized regional FMCG distributor delivery record.',
    };

    return res.json({ success: true, data: invoiceData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get formatted printable / downloadable HTML invoice (Print-to-PDF ready)
// @route   GET /api/orders/:id/invoice/html
exports.getInvoiceHtml = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getAuthorizedOrder(id, req.user, req.query, req.headers);

    if (order === 'UNAUTHORIZED') {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).send('<h2>Access Denied: You are not authorized to view this invoice.</h2>');
    }
    if (!order) {
      return res.status(404).send('<h2>Invoice Not Found</h2>');
    }

    const invoiceDate = formatDate(order.date);
    const subtotalFormatted = formatMoney(order.total);
    const del = order.deliveryDetails || {};

    const rows = (order.items || [])
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #6B7280;">${idx + 1}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB;">
            <strong>${item.name}</strong>
            ${item.pack ? `<div style="font-size: 11px; color: #6B7280;">Pack: ${item.pack}</div>` : ''}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; text-align: right;">${formatMoney(item.unitPrice)}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 600;">${formatMoney(item.unitPrice * item.quantity)}</td>
        </tr>
      `
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderId} - Sree Annapurna Agency</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1F2937;
      margin: 0;
      padding: 32px;
      background-color: #F9FAFB;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #173F35;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #173F35;
      margin: 0 0 4px;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 12px;
      color: #4B5563;
      margin: 0;
    }
    .inv-meta {
      text-align: right;
    }
    .inv-meta h1 {
      margin: 0 0 6px;
      font-size: 24px;
      color: #173F35;
    }
    .inv-meta p {
      margin: 2px 0;
      font-size: 13px;
      color: #4B5563;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 28px;
    }
    .party-box h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6B7280;
      margin: 0 0 8px;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 4px;
    }
    .party-box p {
      margin: 3px 0;
      font-size: 13px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background-color: #F3F4F6;
      color: #374151;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 14px;
      border-bottom: 1px solid #E5E7EB;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .totals-table {
      width: 280px;
    }
    .totals-table td {
      padding: 6px 0;
      font-size: 13px;
    }
    .totals-table tr.grand-total td {
      border-top: 2px solid #173F35;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #173F35;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background-color: #FEF3C7;
      color: #92400E;
    }
    .footer-note {
      border-top: 1px solid #E5E7EB;
      padding-top: 18px;
      font-size: 11.5px;
      color: #6B7280;
      text-align: center;
      line-height: 1.5;
    }
    .no-print-bar {
      max-width: 800px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .btn {
      background-color: #173F35;
      color: #FFFFFF;
      border: 0;
      padding: 9px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-pdf {
      background-color: #B91C1C;
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .invoice-card { border: 0; box-shadow: none; padding: 0; max-width: 100%; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <a href="javascript:history.back()" style="color: #173F35; font-size: 13px; text-decoration: none; font-weight: 600;">← Back</a>
    <div style="display: flex; gap: 10px;">
      <a class="btn btn-pdf" href="/api/orders/${order.orderId}/invoice/pdf${guestToken ? `?token=${guestToken}` : ''}">📥 Download PDF File</a>
      <button class="btn" onclick="window.print()">🖨️ Print Invoice</button>
    </div>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <h2 class="brand-title">${AGENCY_DETAILS.name}</h2>
        <p class="brand-sub">${AGENCY_DETAILS.tagline}</p>
        <p class="brand-sub">${AGENCY_DETAILS.address}</p>
        <p class="brand-sub">Phone: ${AGENCY_DETAILS.phone} · ${AGENCY_DETAILS.email}</p>
      </div>
      <div class="inv-meta">
        <h1>TAX INVOICE</h1>
        <p><strong>Invoice #:</strong> INV-${order.orderId}</p>
        <p><strong>Order Ref:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${invoiceDate}</p>
      </div>
    </div>

    <div class="parties-grid">
      <div class="party-box">
        <h3>Billed &amp; Delivered To</h3>
        <p><strong>${del.name || order.customer}</strong></p>
        <p>${del.address || 'Address on file'}</p>
        <p>${del.city || 'Shimoga'} – ${del.pincode || ''}</p>
        <p>Phone: ${del.phone || order.phone}</p>
        <p>Email: ${del.email || order.customerEmail}</p>
      </div>
      <div class="party-box">
        <h3>Order &amp; Payment Details</h3>
        <p><strong>Fulfillment Status:</strong> <span class="badge">${order.status}</span></p>
        <p><strong>Payment Status:</strong> <span class="badge">${order.payment}</span></p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery / Agency Invoice'}</p>
        ${del.notes ? `<p><strong>Delivery Notes:</strong> ${del.notes}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="text-align: left;">Product Description</th>
          <th style="width: 70px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Unit Price</th>
          <th style="width: 110px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals-area">
      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">${subtotalFormatted}</td>
        </tr>
        <tr>
          <td>Delivery &amp; Packaging:</td>
          <td style="text-align: right; color: #166534; font-weight: 600;">FREE</td>
        </tr>
        <tr class="grand-total">
          <td>Grand Total:</td>
          <td style="text-align: right;">${subtotalFormatted}</td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      <p>Thank you for partnering with <strong>Sree Annapurna Agency</strong>.</p>
      <p>For order queries, wholesale orders, or returns, contact agency support at ${AGENCY_DETAILS.phone} or ${AGENCY_DETAILS.email}.</p>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    next(error);
  }
};
