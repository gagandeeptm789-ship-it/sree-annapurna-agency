const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ---------------------------------------------------------------------------
// Persistent disk storage (fallback when MongoDB is not connected)
// ---------------------------------------------------------------------------
const ORDERS_STORAGE_PATH = path.resolve(__dirname, '../../data/orders.json');
const PRODUCTS_SEED_PATHS = [
  path.resolve(__dirname, '../../../database/seed/products.json'),
  path.resolve(__dirname, '../../database/seed/products.json'),
  path.resolve(__dirname, '../database/seed/products.json'),
];

/** In-memory order cache – populated from disk on startup */
let memoryOrders = [];

function loadPersistentOrders() {
  try {
    if (fs.existsSync(ORDERS_STORAGE_PATH)) {
      const raw = fs.readFileSync(ORDERS_STORAGE_PATH, 'utf8').trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryOrders = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('[Storage] Error reading persistent orders from disk:', err.message);
  }
  return memoryOrders;
}

function savePersistentOrders(orders) {
  try {
    const dir = path.dirname(ORDERS_STORAGE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDERS_STORAGE_PATH, JSON.stringify(orders, null, 2), 'utf8');
    memoryOrders = orders;
  } catch (err) {
    console.error('[Storage] Error saving persistent orders to disk:', err.message);
  }
}

/** Load seed products for price validation when MongoDB is offline */
function getFallbackProducts() {
  for (const seedPath of PRODUCTS_SEED_PATHS) {
    try {
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : (parsed.products || []);
      }
    } catch (_) {
      // try next path
    }
  }
  return [];
}

// Pre-load orders from disk on module initialisation
loadPersistentOrders();

const isDbConnected = () => mongoose.connection.readyState === 1;

// ---------------------------------------------------------------------------
// @desc    Get orders (Owner views all; customers view only their own)
// @route   GET /api/orders          (customer – requires protectCustomer)
// @route   GET /api/orders/owner/all (owner   – requires protectOwner)
// ---------------------------------------------------------------------------
exports.getOrders = async (req, res, next) => {
  try {
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

    // --- MongoDB path ---
    if (isDbConnected()) {
      const query = {};
      if (!isOwner) query.user = customerUserId;
      const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: orders.length, data: orders });
    }

    // --- Persistent storage fallback ---
    const allOrders = loadPersistentOrders();
    const filtered = isOwner
      ? allOrders
      : allOrders.filter((o) => String(o.user) === customerUserId);
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );
    return res.json({ success: true, count: sorted.length, data: sorted });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Get single order by orderId
// @route   GET /api/orders/:id
// ---------------------------------------------------------------------------
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryToken = req.query.token || req.headers['x-order-token'];

    let order = null;

    if (isDbConnected()) {
      order = await Order.findOne({ orderId: id }).lean();
    } else {
      const allOrders = loadPersistentOrders();
      order = allOrders.find((o) => o.orderId === id) || null;
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    const isOwner = req.user && req.user.role === 'owner';
    const customerUserId = req.user && req.user.id ? String(req.user.id) : null;
    const isOrderOwner = Boolean(customerUserId && order.user && String(order.user) === customerUserId);
    const isGuestTokenAuthorized = Boolean(
      !req.user && order.isGuest && queryToken && order.accessToken && queryToken === order.accessToken
    );

    if (isOwner || isOrderOwner || isGuestTokenAuthorized) {
      return res.json({ success: true, data: order });
    }

    if (req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view orders belonging to another account.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication required to inspect this order record.',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Create new order (requires authenticated customer)
// @route   POST /api/orders
// ---------------------------------------------------------------------------
exports.createOrder = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'customer' || !req.user.id || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'Customer sign-in required. Please sign in or register before completing checkout.',
      });
    }

    const { customerName, phone, address, city, pincode, notes, items, paymentMethod } = req.body;
    let idempotencyKey = String(
      (typeof req.get === 'function' ? req.get('Idempotency-Key') : null) ||
      req.headers?.['idempotency-key'] ||
      req.headers?.['Idempotency-Key'] ||
      ''
    ).trim();
    if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}-${Math.random()}`;
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

    // --- Check idempotency ---
    if (isDbConnected()) {
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
    } else {
      const allOrders = loadPersistentOrders();
      const existing = allOrders.find((o) => o.idempotencyKey === idempotencyKey);
      if (existing) {
        if (String(existing.user) !== customerUserId) {
          return res.status(409).json({ success: false, message: 'This submission key has already been used.' });
        }
        return res.status(200).json({
          success: true,
          message: 'This order was already placed.',
          orderId: existing.orderId,
          accessToken: existing.accessToken,
          total: existing.total,
          data: existing,
        });
      }
    }

    // --- Validate items & compute total ---
    const productIds = [...new Set(items.map((item) => item.productId))];
    let productMap = new Map();

    if (isDbConnected()) {
      let canonicalProducts = await Product.find({ id: { $in: productIds } }).lean();
      if (canonicalProducts.length === 0) {
        const { ensureCanonicalCatalogue } = require('../utils/catalogueSeeder');
        await ensureCanonicalCatalogue();
        canonicalProducts = await Product.find({ id: { $in: productIds } }).lean();
      }
      productMap = new Map(canonicalProducts.map((p) => [p.id, p]));
    } else {
      const seedProducts = getFallbackProducts();
      const matching = seedProducts.filter((p) => productIds.includes(p.id));
      productMap = new Map(matching.map((p) => [p.id, p]));
    }

    const validatedItems = [];
    let computedTotal = 0;

    for (const item of items) {
      const canonical = productMap.get(item.productId);
      if (!canonical) {
        return res.status(400).json({
          success: false,
          code: 'PRODUCT_NOT_FOUND',
          message: `Product "${item.name || item.productId}" (ID: ${item.productId}) was not found in the store catalogue. Please refresh your basket.`,
        });
      }

      const isAvailable =
        canonical.active !== false &&
        canonical.isAvailable !== false &&
        canonical.inStock !== false;

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          code: 'PRODUCT_UNAVAILABLE',
          message: `Product "${canonical.name}" is currently unavailable for order.`,
        });
      }

      const quantity = item.quantity;
      // Stock check only if stock field is meaningful
      if (typeof canonical.stock === 'number' && canonical.stock >= 0 && quantity > canonical.stock) {
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

    // --- Save to MongoDB (with transaction) if connected ---
    if (isDbConnected()) {
      const session = await mongoose.startSession();
      let created;
      try {
        await session.withTransaction(async () => {
          for (const item of validatedItems) {
            const result = await Product.updateOne(
              {
                id: item.productId,
                active: { $ne: false },
                isAvailable: { $ne: false },
                inStock: { $ne: false },
                stock: { $gte: item.quantity },
              },
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

      // Also persist to disk for cross-session access
      const allOrders = loadPersistentOrders();
      allOrders.push({ ...orderPayload, _mongoId: String(created._id) });
      savePersistentOrders(allOrders);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        orderId: created.orderId,
        accessToken: created.accessToken,
        total: created.total,
        data: created,
      });
    }

    // --- Persistent storage fallback (MongoDB offline) ---
    const allOrders = loadPersistentOrders();
    allOrders.push(orderPayload);
    savePersistentOrders(allOrders);

    return res.status(201).json({
      success: true,
      mode: 'persistent_storage',
      message: 'Order placed successfully.',
      orderId: orderPayload.orderId,
      accessToken: orderPayload.accessToken,
      total: orderPayload.total,
      data: orderPayload,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Update order status (Owner portal only)
// @route   PATCH /api/orders/:id/status
// ---------------------------------------------------------------------------
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment } = req.body;

    const allowedStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Dispatched', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const allowedPayments = ['Pending', 'Paid', 'Completed', 'Failed', 'Refunded', 'Pending Verification'];
    if (payment && !allowedPayments.includes(payment)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${allowedPayments.join(', ')}`,
      });
    }

    const normalizedPayment = payment === 'Completed' ? 'Paid' : payment;

    // --- MongoDB path ---
    if (isDbConnected()) {
      const order = await Order.findOne({ orderId: id });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order record not found.' });
      }
      if (status && status !== order.status) {
        order.status = status;
        order.statusHistory.push({ status, changedAt: new Date(), changedBy: String(req.user.id || req.user.email) });
      }
      if (normalizedPayment) {
        order.payment = normalizedPayment;
      }
      await order.save();

      // Also update disk copy
      const allOrders = loadPersistentOrders();
      const idx = allOrders.findIndex((o) => o.orderId === id);
      if (idx !== -1) {
        allOrders[idx].status = order.status;
        if (normalizedPayment) allOrders[idx].payment = normalizedPayment;
        if (!allOrders[idx].statusHistory) allOrders[idx].statusHistory = [];
        allOrders[idx].statusHistory.push({ status: order.status, changedAt: new Date(), changedBy: String(req.user.id || req.user.email) });
        savePersistentOrders(allOrders);
      }
      return res.json({ success: true, data: order });
    }

    // --- Persistent storage fallback ---
    const allOrders = loadPersistentOrders();
    const idx = allOrders.findIndex((o) => o.orderId === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }
    const order = allOrders[idx];
    if (status && status !== order.status) {
      order.status = status;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status, changedAt: new Date(), changedBy: String(req.user.id || req.user.email) });
    }
    if (normalizedPayment) {
      order.payment = normalizedPayment;
    }
    allOrders[idx] = order;
    savePersistentOrders(allOrders);

    return res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Clear all operational orders and test transaction logs (Owner portal only)
// @route   DELETE /api/orders/owner/clear-all
// @route   POST   /api/orders/owner/clear-all
// ---------------------------------------------------------------------------
exports.clearAllOrders = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only authorized agency owners can clear operational data.',
      });
    }

    let deletedOrdersCount = 0;

    // 1. Clear orders from MongoDB if connected
    if (isDbConnected()) {
      const result = await Order.deleteMany({});
      deletedOrdersCount += result.deletedCount || 0;
    }

    // 2. Clear orders from persistent disk storage
    const diskOrders = loadPersistentOrders();
    deletedOrdersCount = Math.max(deletedOrdersCount, diskOrders.length);
    savePersistentOrders([]);
    memoryOrders.length = 0;

    // 3. Clean up automated test customer accounts while preserving owner and genuine accounts
    try {
      const usersPath = path.resolve(__dirname, '../../data/users.json');
      if (fs.existsSync(usersPath)) {
        const rawUsers = fs.readFileSync(usersPath, 'utf8').trim();
        if (rawUsers) {
          const parsedUsers = JSON.parse(rawUsers);
          if (Array.isArray(parsedUsers)) {
            // Keep genuine accounts and owners, remove transient test runners
            const testEmailRegex = /^(test\.user\.|friend\.customer\.|ramesh\.a\.|suresh\.b\.|realtest\.|newcustomer\.)/i;
            const keptUsers = parsedUsers.filter((u) => u.role === 'owner' || !testEmailRegex.test(u.email || ''));
            fs.writeFileSync(usersPath, JSON.stringify(keptUsers, null, 2), 'utf8');
          }
        }
      }
    } catch (cleanErr) {
      console.warn('[Storage] Notice during test user cleanup:', cleanErr.message);
    }

    return res.json({
      success: true,
      message: 'Operational orders and test transaction logs cleared successfully. Product catalogue and brand identities permanently preserved.',
      cleared: {
        ordersCount: deletedOrdersCount,
        clearedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Exports for test suites
// ---------------------------------------------------------------------------
exports.loadPersistentOrders = loadPersistentOrders;
exports.savePersistentOrders = savePersistentOrders;
exports.memoryOrders = memoryOrders;
