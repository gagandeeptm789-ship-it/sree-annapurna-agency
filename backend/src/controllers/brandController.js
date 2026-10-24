const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');

const getFallbackBrands = () => {
  const seedPath = path.resolve(__dirname, '../../../database/seed/brands.json');
  if (fs.existsSync(seedPath)) {
    return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
  return [];
};

// @desc    Get all brands
// @route   GET /api/brands
exports.getBrands = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const brands = await Brand.find({}).lean();
      return res.json({ success: true, count: brands.length, data: brands });
    }

    const items = getFallbackBrands();
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

// @desc    Get single brand by id or slug
// @route   GET /api/brands/:id
exports.getBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const brand = await Brand.findOne({ $or: [{ id }, { slug: id }] }).lean();
      if (!brand) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }
      return res.json({ success: true, data: brand });
    }

    const items = getFallbackBrands();
    const brand = items.find((b) => b.id === id || b.slug === id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    return res.json({ success: true, mode: 'fallback_seed', data: brand });
  } catch (error) {
    next(error);
  }
};

