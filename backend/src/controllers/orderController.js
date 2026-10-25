const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Fallback seed loader for local dev when MongoDB Atlas is offline
const getFallbackProducts = () => {
  const seedPath = path.resolve(__dirname, '../../../database/seed/products.json');
  if (fs.existsSync(seedPath)) {
    return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
  return [];
};

// In-memory fallback for local dev when MongoDB Atlas is not yet connected
const memoryOrders = [];
exports.memoryOrders = memoryOrders;

// @desc    Get orders (Owner views all, customers view only their own orders)
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const isOwner = req.user && req.user.role === 'owner';
    const customerEmailFromUser = req.user && req.user.role === 'customer' ? req.user.email : null;
    const queryEmail = (req.query.customerEmail || '').trim().toLowerCase();

    // Determine target email for filtering
    let targetEmail = null;
    if (!isOwner) {
      if (customerEmailFromUser) {
        targetEmail = customerEmailFromUser;
      } else if (queryEmail) {
        targetEmail = queryEmail;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access restricted: Please sign in or provide your customer order email.',
        });
      }
    }

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (targetEmail) {
        query.customerEmail = targetEmail;
      }
      const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: orders.length, data: orders });
    }

    // In-memory fallback
    let list = [...memoryOrders];
    if (targetEmail) {
      list = list.filter((o) => (o.customerEmail || '').toLowerCase() === targetEmail);
    }
    return res.json({ success: true, count: list.length, mode: 'memory_fallback', data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by orderId (restricted to owner, authenticated user, or guest with token)
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isOwner = req.user && req.user.role === 'owner';
    const userEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;
    const queryToken = req.query.token || req.headers['x-order-token'];
    const queryPhone = req.query.phone ? req.query.phone.trim() : null;
    const queryEmail = req.query.email ? req.query.email.trim().toLowerCase() : null;

    let order = null;

    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne({ orderId: id }).lean();
    } else {
      order = memoryOrders.find((o) => o.orderId === id || o.id === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Access authorization check
    const isOwnerAuthorized = isOwner;
    const isCustomerAuthorized = userEmail && order.customerEmail && order.customerEmail.toLowerCase() === userEmail;
    const isUserIdAuthorized = req.user && req.user.id && order.user && String(order.user) === String(req.user.id);
    const isTokenAuthorized = queryToken && order.accessToken && queryToken === order.accessToken;

    if (!isOwnerAuthorized && !isCustomerAuthorized && !isUserIdAuthorized && !isTokenAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only permitted to inspect orders placed by your account.',
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (Requires authenticated customer account) with server-side price validation & stock deduction
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    // 0. Enforce mandatory customer sign-in on backend
    if (!req.user || (req.user.role !== 'customer' && req.user.role !== 'owner')) {
      return res.status(401).json({
        success: false,
        message: 'Customer sign-in required. Please sign in or register before completing checkout.',
      });
    }

    const { customerName, phone, email, address, city, pincode, notes, items, paymentMethod } = req.body;

    if (!phone || !address || !pincode || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required delivery details or empty basket items.',
      });
    }

    const cleanEmail = (req.user.email || email || '').trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = (customerName || req.user.name || '').trim();
    const customerUserId = req.user.id || req.user._id || null;

    if (!cleanName) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    // 1. Retrieve canonical products for server-side price & stock verification
    let canonicalProducts = [];
    if (mongoose.connection.readyState === 1) {
      const productIds = items.map((i) => i.productId);
      canonicalProducts = await Product.find({ id: { $in: productIds } }).lean();
    } else {
      canonicalProducts = getFallbackProducts();
    }
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

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (canonical.stock > 0 && quantity > canonical.stock) {
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

    // 3. Deduct stock in DB if connected
    if (mongoose.connection.readyState === 1) {
      for (const vItem of validatedItems) {
        await Product.updateOne(
          { id: vItem.productId, stock: { $gte: vItem.quantity } },
          { $inc: { stock: -vItem.quantity } }
        );
      }
    }

    const orderId = `SAA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const accessToken = crypto.randomBytes(24).toString('hex');
    const isGuest = !req.user;
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
        utrNumber: req.body.utrNumber ? String(req.body.utrNumber).trim() : '',
        verificationStatus: 'Pending Verification',
        submittedAt: new Date(),
      };
    }

    const orderPayload = {
      orderId,
      accessToken,
      user: customerUserId,
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
      paymentMethod: finalPaymentMethod,
      payment: paymentStatus,
      paymentDetails,
      date: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Order.create(orderPayload);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        orderId: created.orderId,
        accessToken: created.accessToken,
        total: created.total,
        data: created,
      });
    }

    memoryOrders.unshift(orderPayload);
    return res.status(201).json({
      success: true,
      mode: 'memory_fallback',
      message: 'Order created successfully in verified local memory.',
      orderId: orderPayload.orderId,
      accessToken: orderPayload.accessToken,
      total: orderPayload.total,
      data: orderPayload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Protected: Owner operations portal only)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment } = req.body;

    const allowedStatuses = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const allowedPayments = ['Pending', 'Paid', 'Failed', 'Refunded', 'Pending Verification'];
    if (payment && !allowedPayments.includes(payment)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${allowedPayments.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (status) updateData.status = status;
      if (payment) updateData.payment = payment;

      const updated = await Order.findOneAndUpdate({ orderId: id }, updateData, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order record not found.' });
      }
      return res.json({ success: true, data: updated });
    }

    const order = memoryOrders.find((o) => o.orderId === id || o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }
    if (status) order.status = status;
    if (payment) order.payment = payment;

    return res.json({ success: true, mode: 'memory_fallback', data: order });
  } catch (error) {
    next(error);
  }
};
