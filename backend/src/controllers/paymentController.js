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

    const amountInPaise = Math.round(order.total * 100);

    // If live/test Razorpay keys are configured in environment
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
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

    // Sandbox / Test Mode when gateway credentials are not yet entered
    const sandboxTransactionId = `test_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return res.json({
      success: true,
      mode: 'sandbox_test_gateway',
      message: 'Razorpay keys not configured in backend/.env. Running in verified sandbox mode.',
      keyId: 'rzp_test_placeholder',
      sandboxTransactionId,
      orderId: order.orderId,
      amount: amountInPaise,
      currency: 'INR',
      displayAmount: order.total,
      notes: 'Test payment simulation only — configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET for live transactions.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and update order status
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, sandboxTransactionId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required for payment verification.' });
    }

    let isVerified = false;

    // Live or Test Razorpay signature verification
    if (RAZORPAY_KEY_SECRET && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
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
    } else if (sandboxTransactionId) {
      // Sandbox validation: marks as test-verified
      isVerified = true;
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature or transaction mismatch.',
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
    const order = (memoryOrders || []).find((o) => o.orderId === orderId || o.id === orderId);
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
