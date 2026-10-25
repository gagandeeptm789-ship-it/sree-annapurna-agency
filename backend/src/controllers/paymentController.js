const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');

// Persistent storage fallback
const ORDERS_STORAGE_PATH = path.resolve(__dirname, '../../data/orders.json');

function loadPersistentOrders() {
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

function savePersistentOrders(orders) {
  try {
    const dir = path.dirname(ORDERS_STORAGE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDERS_STORAGE_PATH, JSON.stringify(orders, null, 2), 'utf8');
  } catch (_) {}
}

async function findOrderRecord(orderId) {
  if (mongoose.connection.readyState === 1) {
    return await Order.findOne({ orderId });
  }
  const allOrders = loadPersistentOrders();
  return allOrders.find((o) => o.orderId === orderId) || null;
}

function setDotProp(obj, key, val) {
  const parts = key.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {};
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = val;
}

async function saveOrderRecord(orderId, updateFields) {
  if (mongoose.connection.readyState === 1) {
    return await Order.findOneAndUpdate(
      { orderId },
      updateFields,
      { new: true }
    );
  }
  const allOrders = loadPersistentOrders();
  const idx = allOrders.findIndex((o) => o.orderId === orderId);
  if (idx !== -1) {
    for (const [key, val] of Object.entries(updateFields)) {
      if (key.includes('.')) {
        setDotProp(allOrders[idx], key, val);
      } else {
        allOrders[idx][key] = val;
      }
    }
    savePersistentOrders(allOrders);
    return allOrders[idx];
  }
  return null;
}

// Environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

function requireDatabase(res) {
  return true; // We now have reliable persistent fallback
}

function isAuthorizedOrderAccess(req, order) {
  const isOwner = req.user?.role === 'owner';
  const isCustomerOwner = req.user?.role === 'customer' &&
    req.user.id && order.user && String(order.user) === String(req.user.id);
  const isGuestTokenAuthorized = !req.user && order.isGuest &&
    req.headers['x-order-token'] && order.accessToken &&
    req.headers['x-order-token'] === order.accessToken;
  return Boolean(isOwner || isCustomerOwner || isGuestTokenAuthorized);
}

// @desc    Initiate payment order (Razorpay or Sandbox)
// @route   POST /api/payments/create-order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required to initiate payment.' });
    }

    const order = await findOrderRecord(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    if (!isAuthorizedOrderAccess(req, order)) {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).json({ success: false, message: 'Access denied: You are not authorized to initiate payment for this order.' });
    }

    const amountInPaise = Math.round(order.total * 100);

    // If live/test Razorpay keys are configured in environment
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes('placeholder')) {
      const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderId,
          notes: {
            agency: 'Sree Annapurna Agency',
            customer: order.customer,
          },
        }),
      });

      const rzpOrder = await response.json();
      if (!response.ok) {
        return res.status(502).json({
          success: false,
          message: rzpOrder.error ? rzpOrder.error.description : 'Payment gateway error',
          gatewayError: rzpOrder,
        });
      }

      return res.json({
        success: true,
        mode: 'razorpay_live_or_test',
        keyId: RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        orderId: order.orderId,
      });
    }

    // Secured Test Mode when Razorpay keys are not yet configured in environment
    if (process.env.NODE_ENV === 'production' || !process.env.TEST_PAYMENT_SECRET) {
      return res.status(503).json({ success: false, message: 'A live payment gateway is not configured.' });
    }
    const sandboxTransactionId = `test_tx_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const testSignature = crypto
      .createHmac('sha256', process.env.TEST_PAYMENT_SECRET)
      .update(`${order.orderId}|${amountInPaise}|${sandboxTransactionId}`)
      .digest('hex');

    return res.json({
      success: true,
      mode: 'test_mode',
      message: 'Razorpay keys not configured in backend/.env. Running in secured test mode.',
      keyId: 'rzp_test_placeholder',
      sandboxTransactionId,
      testSignature,
      orderId: order.orderId,
      amount: amountInPaise,
      currency: 'INR',
      displayAmount: order.total,
      notes: 'Test mode verification only — configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET for production.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and update order status
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, sandboxTransactionId, testSignature } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required for payment verification.' });
    }

    const order = await findOrderRecord(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    if (!isAuthorizedOrderAccess(req, order)) {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).json({ success: false, message: 'Access denied: You are not authorized to verify payment for this order.' });
    }

    let isVerified = false;

    // 1. Live/Test Razorpay HMAC signature verification
    if (RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID?.includes('placeholder') && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature);
      const actualBuffer = Buffer.from(razorpaySignature);

      if (expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
        isVerified = true;
      }
    } else if (process.env.NODE_ENV !== 'production' && process.env.TEST_PAYMENT_SECRET && sandboxTransactionId && testSignature) {
      // 2. Cryptographically validated test mode signature verification
      const amountInPaise = Math.round(order.total * 100);
      const expectedTestSignature = crypto
        .createHmac('sha256', process.env.TEST_PAYMENT_SECRET)
        .update(`${order.orderId}|${amountInPaise}|${sandboxTransactionId}`)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedTestSignature);
      const actualBuffer = Buffer.from(testSignature);

      if (expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: cryptographic signature or transaction mismatch.',
      });
    }

    // Update order payment status to 'Paid' and fulfillment to 'Confirmed'
    const paymentRecord = {
      transactionId: razorpayPaymentId || sandboxTransactionId || `tx_${Date.now()}`,
      provider: RAZORPAY_KEY_SECRET ? 'razorpay' : 'sandbox',
      paidAt: new Date(),
    };

    const updated = await saveOrderRecord(
      orderId,
      { payment: 'Paid', paymentDetails: paymentRecord }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }
    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record failed or cancelled payment attempt
// @route   POST /api/payments/fail
exports.recordPaymentFailure = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }

    const failureReason = reason || 'Payment cancelled by customer or rejected by provider.';
    const order = await findOrderRecord(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order record not found.' });
    if (!isAuthorizedOrderAccess(req, order)) {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).json({ success: false, message: 'Access denied: You are not authorized to update this order payment.' });
    }
    const updated = await saveOrderRecord(
      orderId,
      { payment: 'Failed', 'paymentDetails.failureReason': failureReason }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Order record not found.' });
    return res.json({ success: true, message: 'Payment marked as failed. Retry available.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
exports.handleWebhook = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const signature = req.headers['x-razorpay-signature'];
    if (RAZORPAY_WEBHOOK_SECRET) {
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing webhook signature.' });
      }

      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expected = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      const expectedBuf = Buffer.from(expected);
      const actualBuf = Buffer.from(signature);

      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' && payload?.payment?.entity) {
      const p = payload.payment.entity;
      const orderReceipt = p.notes?.orderId || p.description;
      if (orderReceipt && mongoose.connection.readyState === 1) {
        await Order.findOneAndUpdate({ orderId: orderReceipt }, { payment: 'Paid' });
      }
    }

    return res.json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit UPI UTR transaction reference for PhonePe / UPI payment verification
// @route   POST /api/payments/submit-utr
exports.submitUpiPayment = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { orderId, utrNumber, notes } = req.body;
    if (typeof orderId !== 'string' || typeof utrNumber !== 'string' || !orderId || !utrNumber) {
      return res.status(400).json({ success: false, message: 'orderId and utrNumber are required.' });
    }

    const cleanUtr = utrNumber.trim();
    if (!/^[A-Za-z0-9]{6,20}$/.test(cleanUtr)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 12-digit UPI reference (UTR) number.' });
    }

    const order = await findOrderRecord(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    if (!isAuthorizedOrderAccess(req, order)) {
      const statusCode = req.user ? 403 : 401;
      return res.status(statusCode).json({ success: false, message: 'Access denied: You are not authorized to update payment details for this order.' });
    }

    const upiDetails = {
      provider: 'phonepe_upi',
      payeeName: 'GAGAN DEEP',
      payeeUpiNumber: '6360074675',
      utrNumber: cleanUtr,
      verificationStatus: 'Pending Verification',
      submittedAt: new Date(),
      failureReason: '',
      adminNotes: notes ? String(notes).trim() : '',
    };

    const updated = await saveOrderRecord(
      orderId,
      {
        paymentMethod: 'UPI / PhonePe',
        payment: 'Pending',
        paymentDetails: upiDetails,
      }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Order record not found.' });
    return res.json({
      success: true,
      message: 'UPI payment reference submitted successfully. Status: Payment Pending Verification.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject UPI payment (Owner Portal only)
// @route   POST /api/payments/verify-upi
exports.verifyUpiPayment = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { orderId, action, rejectReason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }

    const isApprove = action === 'approve' || action === 'confirm';
    const isReject = action === 'reject';

    if (!isApprove && !isReject) {
      return res.status(400).json({ success: false, message: 'Action must be either "approve" or "reject".' });
    }

    const order = await findOrderRecord(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    const verifiedBy = req.user?.email || 'Agency Owner';

    if (isApprove) {
      const updateData = {
        payment: 'Paid',
        'paymentDetails.verificationStatus': 'Verified',
        'paymentDetails.verifiedAt': new Date(),
        'paymentDetails.verifiedBy': verifiedBy,
        'paymentDetails.paidAt': new Date(),
        'paymentDetails.failureReason': '',
      };

      const updated = await saveOrderRecord(orderId, updateData);
      if (!updated) return res.status(404).json({ success: false, message: 'Order record not found.' });
      return res.json({
        success: true,
        message: 'UPI Payment verified successfully.',
        data: updated,
      });
    }

    // Reject flow
    const failureReason = rejectReason || 'Payment verification rejected by owner (UTR not found or amount mismatch).';
    const updateData = {
      payment: 'Failed',
      'paymentDetails.verificationStatus': 'Rejected',
      'paymentDetails.verifiedAt': new Date(),
      'paymentDetails.verifiedBy': verifiedBy,
      'paymentDetails.failureReason': failureReason,
    };

    const updated = await saveOrderRecord(orderId, updateData);
    if (!updated) return res.status(404).json({ success: false, message: 'Order record not found.' });
    return res.json({
      success: true,
      message: 'UPI Payment rejected.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
