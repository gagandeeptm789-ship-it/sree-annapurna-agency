const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

function requireDatabase(res) {
  if (mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    success: false,
    message: 'Order service is unavailable because the database is not connected. Please retry shortly.',
  });
  return false;
}

// @desc    Get orders (Owner views all, customers view only their own orders)
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Please sign in to view order history.',
      });
    }

    const isOwner = req.user.role === 'owner';
    const customerUserId = req.user.id ? String(req.user.id) : null;

    if (!isOwner && !customerUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: Customer account ID required.',
      });
    }

    const query = {};
    if (!isOwner) {
      query.user = customerUserId;
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by orderId (restricted to owner, authenticated owner of order, or guest with token)
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { id } = req.params;
    const queryToken = req.query.token || req.headers['x-order-token'];

    let order = null;

    order = await Order.findOne({ orderId: id }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Access authorization check
    const isOwner = req.user && req.user.role === 'owner';
    const customerUserId = req.user && req.user.id ? String(req.user.id) : null;
    const isOrderOwner = Boolean(customerUserId && order.user && String(order.user) === customerUserId);
    const isGuestTokenAuthorized = Boolean(
      !req.user && order.isGuest && queryToken && order.accessToken && queryToken === order.accessToken
    );

    if (isOwner || isOrderOwner || isGuestTokenAuthorized) {
      return res.json({
        success: true,
        data: order,
      });
    }

    // If authenticated as a customer but order does not belong to them -> 403 Forbidden
    if (req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view orders belonging to another account.',
      });
    }

    // If unauthenticated -> 401 Unauthorized
    return res.status(401).json({
      success: false,
      message: 'Authentication required to inspect this order record.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (Requires authenticated customer account) with server-side price validation & stock deduction
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    if (!req.user || req.user.role !== 'customer' || !req.user.id || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'Customer sign-in required. Please sign in or register before completing checkout.',
      });
    }

    const { customerName, phone, address, city, pincode, notes, items, paymentMethod } = req.body;
    const idempotencyKey = String(req.get('Idempotency-Key') || '').trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return res.status(400).json({ success: false, message: 'A valid idempotency key is required.' });
    }

    if (
      typeof phone !== 'string' || typeof address !== 'string' ||
      typeof pincode !== 'string' || !Array.isArray(items) || items.length === 0 || items.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required delivery details or empty basket items.',
      });
    }

    const cleanEmail = String(req.user.email).trim().toLowerCase();
    const cleanPhone = phone.trim();
    if ((customerName !== undefined && typeof customerName !== 'string') ||
      typeof city !== 'string' || (notes !== undefined && typeof notes !== 'string')) {
      return res.status(400).json({ success: false, message: 'Please provide valid customer and delivery details.' });
    }
    const cleanName = (customerName || req.user.name || '').trim();
    const customerUserId = String(req.user.id);

    if (!cleanName) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    if (!/^\+?[0-9\s()-]{10,18}$/.test(cleanPhone) || cleanPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
    }

    if (!address.trim() || !city?.trim() || !/^[0-9A-Za-z -]{5,10}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid delivery address, city, and PIN code.' });
    }
    if (paymentMethod !== undefined && !['COD', 'ONLINE', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Unsupported payment method.' });
    }
    if (paymentMethod === 'UPI' &&
      (typeof req.body.utrNumber !== 'string' || !/^[A-Za-z0-9]{6,20}$/.test(req.body.utrNumber.trim()))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid UPI reference. It will remain unverified until reviewed.' });
    }
    if (items.some((item) => !item || typeof item.productId !== 'string' ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000)) {
      return res.status(400).json({ success: false, message: 'Each item must include a valid product and quantity.' });
    }

    const existingOrder = await Order.findOne({ idempotencyKey }).select('+idempotencyKey').lean();
    if (existingOrder) {
      if (String(existingOrder.user) !== customerUserId) {
        return res.status(409).json({ success: false, message: 'This submission key has already been used.' });
      }
      return res.status(200).json({
        success: true,
        message: 'This order was already placed.',
        orderId: existingOrder.orderId,
        accessToken: existingOrder.accessToken,
        total: existingOrder.total,
        data: existingOrder,
      });
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const canonicalProducts = await Product.find({ id: { $in: productIds } }).lean();
    const productMap = new Map(canonicalProducts.map((p) => [p.id, p]));

    // 2. Validate items, recalculate prices from canonical catalog, and check stock
    const validatedItems = [];
    let computedTotal = 0;

    for (const item of items) {
      const canonical = productMap.get(item.productId);
      if (!canonical || canonical.active === false) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || item.productId}" is currently unavailable for order.`,
        });
      }

      const quantity = item.quantity;
      if (quantity > canonical.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity for "${canonical.name}" (${quantity}) exceeds available stock (${canonical.stock}).`,
        });
      }

      const canonicalUnitPrice = canonical.price;
      computedTotal += canonicalUnitPrice * quantity;

      validatedItems.push({
        productId: canonical.id,
        name: canonical.name,
        pack: item.pack || canonical.pack || 'Standard pack',
        quantity,
        unitPrice: canonicalUnitPrice,
        image: canonical.image || item.image || '',
      });
    }

    const orderId = `SAA-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
    const accessToken = crypto.randomBytes(24).toString('hex');
    let finalPaymentMethod = 'Cash on Delivery / Agency Invoice';
    let paymentDetails = {};
    let paymentStatus = 'Pending';

    if (paymentMethod === 'ONLINE') {
      finalPaymentMethod = 'Online Payment (UPI/Cards)';
    } else if (paymentMethod === 'UPI' || paymentMethod === 'UPI / PhonePe') {
      finalPaymentMethod = 'UPI / PhonePe';
      paymentStatus = 'Pending';
      paymentDetails = {
        provider: 'phonepe_upi',
        payeeName: 'GAGAN DEEP',
        payeeUpiNumber: '6360074675',
        utrNumber: req.body.utrNumber.trim(),
        verificationStatus: 'Pending Verification',
        submittedAt: new Date(),
      };
    }

    const orderPayload = {
      orderId,
      accessToken,
      user: customerUserId,
      idempotencyKey,
      isGuest: false,
      customer: cleanName,
      customerEmail: cleanEmail,
      phone: cleanPhone,
      deliveryDetails: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: address.trim(),
        city: (city || 'Shimoga').trim(),
        pincode: pincode.trim(),
        notes: notes ? notes.trim() : '',
      },
      items: validatedItems,
      total: computedTotal,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', changedAt: new Date(), changedBy: customerUserId }],
      paymentMethod: finalPaymentMethod,
      payment: paymentStatus,
      paymentDetails,
      date: new Date(),
    };

    const session = await mongoose.startSession();
    let created;
    try {
      await session.withTransaction(async () => {
        for (const item of validatedItems) {
          const result = await Product.updateOne(
            { id: item.productId, active: { $ne: false }, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
          );
          if (result.modifiedCount !== 1) {
            throw Object.assign(new Error(`Insufficient stock for "${item.name}".`), { status: 409 });
          }
        }
        [created] = await Order.create([orderPayload], { session });
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
        const duplicate = await Order.findOne({ idempotencyKey }).select('+idempotencyKey').lean();
        if (duplicate && String(duplicate.user) === customerUserId) {
          return res.status(200).json({
            success: true,
            message: 'This order was already placed.',
            orderId: duplicate.orderId,
            accessToken: duplicate.accessToken,
            total: duplicate.total,
            data: duplicate,
          });
        }
      }
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      orderId: created.orderId,
      accessToken: created.accessToken,
      total: created.total,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Protected: Owner operations portal only)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;
    const { id } = req.params;
    const { status } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, 'payment')) {
      return res.status(400).json({ success: false, message: 'Payment verification must use the payment verification endpoint.' });
    }
    const allowedStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Dispatched', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }
    if (status && status !== order.status) {
      order.status = status;
      order.statusHistory.push({ status, changedAt: new Date(), changedBy: String(req.user.id || req.user.email) });
      await order.save();
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
