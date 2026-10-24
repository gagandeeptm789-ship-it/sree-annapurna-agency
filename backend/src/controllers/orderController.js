const mongoose = require('mongoose');
const Order = require('../models/Order');

// In-memory fallback for local dev when MongoDB Atlas is not yet connected
const memoryOrders = [];

// @desc    Get orders (Admin views all, customer views by email)
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { customerEmail } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (customerEmail) {
        query.customerEmail = customerEmail.toLowerCase();
      }
      const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: orders.length, data: orders });
    }

    // In-memory fallback
    let list = [...memoryOrders];
    if (customerEmail) {
      list = list.filter((o) => (o.customerEmail || '').toLowerCase() === customerEmail.toLowerCase());
    }
    return res.json({ success: true, count: list.length, mode: 'memory_fallback', data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by orderId
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ orderId: id }).lean();
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, data: order });
    }

    const order = memoryOrders.find((o) => o.orderId === id || o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, mode: 'memory_fallback', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (Customer checkout)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, email, address, city, pincode, notes, items, total } = req.body;

    if (!customerName || !phone || !email || !address || !pincode || !items || !total) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields (customerName, phone, email, address, pincode, items, total)',
      });
    }

    const orderId = `SAA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      orderId,
      customer: customerName,
      customerEmail: email.toLowerCase(),
      phone,
      deliveryDetails: {
        name: customerName,
        phone,
        email: email.toLowerCase(),
        address,
        city: city || 'Shimoga',
        pincode,
        notes: notes || '',
      },
      items,
      total,
      status: 'Pending',
      payment: 'Pending',
      date: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const order = await Order.create(orderPayload);
      return res.status(201).json({ success: true, data: order });
    }

    memoryOrders.unshift(orderPayload);
    return res.status(201).json({
      success: true,
      mode: 'memory_fallback',
      message: 'Order created in temporary memory store. Connect MongoDB Atlas to persist permanently.',
      data: orderPayload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Owner / Admin panel)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment } = req.body;

    const allowedStatuses = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (status) updateData.status = status;
      if (payment) updateData.payment = payment;

      const updated = await Order.findOneAndUpdate({ orderId: id }, updateData, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, data: updated });
    }

    const order = memoryOrders.find((o) => o.orderId === id || o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (status) order.status = status;
    if (payment) order.payment = payment;

    return res.json({ success: true, mode: 'memory_fallback', data: order });
  } catch (error) {
    next(error);
  }
};

