const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');

const getFallbackBrands = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../../database/seed/brands.json'),
    path.resolve(__dirname, '../../../database/seed/brands.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  }
  return [];
};

// @desc    Get all brands
// @route   GET /api/brands
exports.getBrands = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const brandCount = await Brand.countDocuments();
      if (brandCount === 0) {
        const { ensureCanonicalCatalogue } = require('../utils/catalogueSeeder');
        await ensureCanonicalCatalogue();
      }
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

