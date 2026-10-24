const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Fallback seed loader for offline/local development
const getFallbackProducts = () => {
  const seedPath = path.resolve(__dirname, '../../../database/seed/products.json');
  if (fs.existsSync(seedPath)) {
    return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
  return [];
};

// @desc    Get all products (with optional filter by brandId or category)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { brandId, category, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { active: true };
      if (brandId) query.brandId = brandId;
      if (category) query.category = category;
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const products = await Product.find(query).lean();
      return res.json({ success: true, count: products.length, data: products });
    }

    // Fallback mode when DB is not yet connected
    let items = getFallbackProducts().filter((p) => p.active !== false);
    if (brandId) items = items.filter((p) => p.brandId === brandId);
    if (category) items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (search) {
      const term = search.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }

    return res.json({
      success: true,
      count: items.length,
      mode: 'fallback_seed',
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id or sku
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findOne({ $or: [{ id }, { sku: id }] }).lean();
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, data: product });
    }

    // Fallback mode
    const items = getFallbackProducts();
    const product = items.find((p) => p.id === id || p.sku === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, mode: 'fallback_seed', data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection required to create products. Configure MONGODB_URI in backend/.env',
      });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection required to update products. Configure MONGODB_URI in backend/.env',
      });
    }

    const { id } = req.params;
    const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

