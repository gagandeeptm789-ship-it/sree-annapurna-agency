const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');

// Environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// @desc    Initiate payment order (Razorpay or Sandbox)
// @route   POST /api/payments/create-order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required to initiate payment.' });
    }

    let order = null;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne({ orderId });
    } else {
      const { memoryOrders } = require('./orderController');
      order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Verify customer ownership
    const isOwner = req.user && req.user.role === 'owner';
    const userEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;
    const isAuthorized = isOwner || (userEmail && order.customerEmail && order.customerEmail.toLowerCase() === userEmail) || (req.user && req.user.id && order.user && String(order.user) === String(req.user.id));
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to initiate payment for this order.' });
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
    const sandboxTransactionId = `test_tx_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const secretForTest = process.env.JWT_SECRET || 'saa-master-secret-key-fmcg-2026-sree-annapurna-agency';
    const testSignature = crypto
      .createHmac('sha256', secretForTest)
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
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, sandboxTransactionId, testSignature } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required for payment verification.' });
    }

    let order = null;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne({ orderId });
    } else {
      const { memoryOrders } = require('./orderController');
      order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Verify ownership
    const isOwner = req.user && req.user.role === 'owner';
    const userEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;
    const isAuthorized = isOwner || (userEmail && order.customerEmail && order.customerEmail.toLowerCase() === userEmail) || (req.user && req.user.id && order.user && String(order.user) === String(req.user.id));
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to verify payment for this order.' });
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
    } else if (sandboxTransactionId && testSignature) {
      // 2. Cryptographically validated test mode signature verification
      const amountInPaise = Math.round(order.total * 100);
      const secretForTest = process.env.JWT_SECRET || 'saa-master-secret-key-fmcg-2026-sree-annapurna-agency';
      const expectedTestSignature = crypto
        .createHmac('sha256', secretForTest)
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

    if (mongoose.connection.readyState === 1) {
      const updated = await Order.findOneAndUpdate(
        { orderId },
        { 
          payment: 'Paid', 
          status: 'Confirmed',
          paymentDetails: paymentRecord 
        },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order record not found.' });
      }
      return res.json({
        success: true,
        message: 'Payment verified successfully. Order confirmed.',
        data: updated,
      });
    }

    // In-memory update
    const { memoryOrders } = require('./orderController');
    order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
    if (order) {
      order.payment = 'Paid';
      order.status = 'Confirmed';
      order.paymentDetails = paymentRecord;
    }

    return res.json({
      success: true,
      mode: 'sandbox_test_gateway',
      message: 'Sandbox payment verified successfully. Order status updated.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record failed or cancelled payment attempt
// @route   POST /api/payments/fail
exports.recordPaymentFailure = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }

    const failureReason = reason || 'Payment cancelled by customer or rejected by provider.';

    if (mongoose.connection.readyState === 1) {
      const updated = await Order.findOneAndUpdate(
        { orderId },
        {
          payment: 'Failed',
          'paymentDetails.failureReason': failureReason,
        },
        { new: true }
      );
      return res.json({ success: true, message: 'Payment marked as failed. Retry available.', data: updated });
    }

    const { memoryOrders } = require('./orderController');
    const order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
    if (order) {
      order.payment = 'Failed';
      order.paymentDetails = { ...(order.paymentDetails || {}), failureReason };
    }

    return res.json({ success: true, mode: 'memory_fallback', message: 'Payment marked as failed. Retry available.', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
exports.handleWebhook = async (req, res, next) => {
  try {
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
        await Order.findOneAndUpdate({ orderId: orderReceipt }, { payment: 'Paid', status: 'Confirmed' });
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
    const { orderId, utrNumber, notes } = req.body;
    if (!orderId || !utrNumber) {
      return res.status(400).json({ success: false, message: 'orderId and utrNumber are required.' });
    }

    const cleanUtr = String(utrNumber).trim();
    if (cleanUtr.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 12-digit UPI reference (UTR) number.' });
    }

    let order = null;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne({ orderId });
    } else {
      const { memoryOrders } = require('./orderController');
      order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Verify ownership
    const isOwner = req.user && req.user.role === 'owner';
    const userEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;
    const isAuthorized = isOwner || 
      (userEmail && order.customerEmail && order.customerEmail.toLowerCase() === userEmail) || 
      (req.user && req.user.id && order.user && String(order.user) === String(req.user.id)) ||
      (req.headers['x-order-token'] && order.accessToken && req.headers['x-order-token'] === order.accessToken);

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to update payment details for this order.' });
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

    if (mongoose.connection.readyState === 1) {
      const updated = await Order.findOneAndUpdate(
        { orderId },
        {
          paymentMethod: 'UPI / PhonePe',
          payment: 'Pending',
          paymentDetails: upiDetails,
        },
        { new: true }
      );
      return res.json({
        success: true,
        message: 'UPI payment reference submitted successfully. Status: Payment Pending Verification.',
        data: updated,
      });
    }

    order.paymentMethod = 'UPI / PhonePe';
    order.payment = 'Pending';
    order.paymentDetails = { ...(order.paymentDetails || {}), ...upiDetails };

    return res.json({
      success: true,
      mode: 'memory_fallback',
      message: 'UPI payment reference recorded in local memory. Status: Payment Pending Verification.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject UPI payment (Owner Portal only)
// @route   POST /api/payments/verify-upi
exports.verifyUpiPayment = async (req, res, next) => {
  try {
    const { orderId, action, rejectReason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }

    const isApprove = action === 'approve' || action === 'confirm';
    const isReject = action === 'reject';

    if (!isApprove && !isReject) {
      return res.status(400).json({ success: false, message: 'Action must be either "approve" or "reject".' });
    }

    let order = null;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne({ orderId });
    } else {
      const { memoryOrders } = require('./orderController');
      order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    const verifiedBy = req.user?.email || 'Agency Owner';

    if (isApprove) {
      const updateData = {
        payment: 'Paid',
        status: 'Confirmed',
        'paymentDetails.verificationStatus': 'Verified',
        'paymentDetails.verifiedAt': new Date(),
        'paymentDetails.verifiedBy': verifiedBy,
        'paymentDetails.paidAt': new Date(),
        'paymentDetails.failureReason': '',
      };

      if (mongoose.connection.readyState === 1) {
        const updated = await Order.findOneAndUpdate({ orderId }, updateData, { new: true });
        return res.json({
          success: true,
          message: 'UPI Payment verified successfully. Order confirmed.',
          data: updated,
        });
      }

      order.payment = 'Paid';
      order.status = 'Confirmed';
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        verificationStatus: 'Verified',
        verifiedAt: new Date(),
        verifiedBy,
        paidAt: new Date(),
        failureReason: '',
      };

      return res.json({
        success: true,
        mode: 'memory_fallback',
        message: 'UPI Payment marked as Paid in local memory. Order confirmed.',
        data: order,
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

    if (mongoose.connection.readyState === 1) {
      const updated = await Order.findOneAndUpdate({ orderId }, updateData, { new: true });
      return res.json({
        success: true,
        message: 'UPI Payment rejected.',
        data: updated,
      });
    }

    order.payment = 'Failed';
    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      verificationStatus: 'Rejected',
      verifiedAt: new Date(),
      verifiedBy,
      failureReason,
    };

    return res.json({
      success: true,
      mode: 'memory_fallback',
      message: 'UPI Payment marked as Failed in local memory.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
