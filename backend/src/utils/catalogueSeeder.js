const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

const getSeedFile = (filename) => {
  const possiblePaths = [
    path.resolve(__dirname, '../../../database/seed', filename),
    path.resolve(__dirname, '../../database/seed', filename),
    path.resolve(__dirname, '../database/seed', filename),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {
        console.error(`[CatalogueSeeder] Error reading ${p}:`, e.message);
      }
    }
  }
  return [];
};

/**
 * Ensures MongoDB Atlas contains all 33 canonical products and 6 brands.
 * Runs automatically if the products collection is empty.
 * 100% idempotent: uses findOneAndUpdate with unique 'id'.
 * Uses $setOnInsert for stock so it NEVER overwrites decremented inventory.
 * Strictly preserves all users, orders, payments, and other collections.
 */
async function ensureCanonicalCatalogue() {
  if (mongoose.connection.readyState !== 1) {
    return { success: false, message: 'Database not connected' };
  }

  try {
    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      console.log('[CatalogueSeeder] Products collection in Atlas is empty. Auto-seeding canonical catalogue...');

      const brandsData = getSeedFile('brands.json');
      if (Array.isArray(brandsData) && brandsData.length > 0) {
        for (const b of brandsData) {
          await Brand.findOneAndUpdate(
            { id: b.id },
            {
              $set: {
                id: b.id,
                name: b.name,
                slug: b.slug,
                category: b.category,
                description: b.description,
                color: b.color,
                image: b.image,
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
        console.log(`[CatalogueSeeder] Seeded ${brandsData.length} brands into Atlas.`);
      }

      const productsData = getSeedFile('products.json');
      if (Array.isArray(productsData) && productsData.length > 0) {
        for (const p of productsData) {
          await Product.findOneAndUpdate(
            { id: p.id },
            {
              $set: {
                id: p.id,
                name: p.name,
                brandId: p.brandId,
                category: p.category,
                description: p.description,
                price: p.price,
                sku: p.sku,
                pack: p.pack,
                image: p.image,
                active: p.active !== false,
                isAvailable: true,
              },
              $setOnInsert: {
                stock: typeof p.stock === 'number' ? p.stock : 40,
                inStock: (p.stock || 0) > 0,
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
        console.log(`[CatalogueSeeder] Seeded ${productsData.length} products into Atlas.`);
      }

      const verifiedCount = await Product.countDocuments();
      return { success: true, seeded: true, count: verifiedCount };
    }

    return { success: true, seeded: false, count: existingCount };
  } catch (err) {
    console.error('[CatalogueSeeder] Error during catalogue auto-seed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  ensureCanonicalCatalogue,
  getSeedFile,
};

