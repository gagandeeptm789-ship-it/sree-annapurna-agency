/**
 * SREE ANNAPURNA AGENCY - PRODUCT STOCK & AVAILABILITY MIGRATION SCRIPT
 *
 * This script connects to the MongoDB Atlas database configured in backend/.env
 * (or updates the local seed data if running in offline mode) and:
 *  1. Ensures all existing products in MongoDB Atlas have active: true, isAvailable: true, inStock: true.
 *  2. Updates stock quantities to at least 50 (or user-specified amount) so checkout succeeds immediately.
 *  3. Upserts any missing products from the canonical 33-item catalogue.
 *  4. Verifies the database state and prints a live inspection report.
 */

const fs = require('fs');
const path = require('path');

function resolveModule(name) {
  try {
    return require(name);
  } catch {
    return require(path.resolve(__dirname, '../../backend/node_modules', name));
  }
}

const mongoose = resolveModule('mongoose');
const dotenv = resolveModule('dotenv');

// Load environment variables from backend/.env
const envPath = path.resolve(__dirname, '../../backend/.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;

// Schemas
const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brandId: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, default: 50 },
    pack: { type: String },
    image: { type: String },
    active: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BrandSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String },
    description: { type: String },
    color: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

async function runMigration() {
  console.log('\n======================================================');
  console.log('🔄 SREE ANNAPURNA AGENCY - PRODUCT STOCK MIGRATION');
  console.log('======================================================');

  // Step 1: Check and update local seed file first
  const seedPath = path.resolve(__dirname, '../seed/products.json');
  const brandsSeedPath = path.resolve(__dirname, '../seed/brands.json');

  if (fs.existsSync(seedPath)) {
    try {
      const rawProducts = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      const updatedLocal = rawProducts.map((p) => ({
        ...p,
        stock: Math.max(typeof p.stock === 'number' ? p.stock : 0, 50),
        active: true,
        isAvailable: true,
        inStock: true,
      }));
      fs.writeFileSync(seedPath, JSON.stringify(updatedLocal, null, 2), 'utf8');
      console.log(`✓ Local fallback catalogue updated: ${updatedLocal.length} products with stock >= 50 and active/isAvailable/inStock = true.`);
    } catch (e) {
      console.warn('⚠️ Could not update local seed file:', e.message);
    }
  }

  // Step 2: Check MongoDB Atlas URI
  if (!uri || !uri.trim()) {
    console.log('\n⚠️ [Notice] MONGODB_URI is currently empty in backend/.env');
    console.log('  To migrate your remote MongoDB Atlas database:');
    console.log('  1. Open backend/.env');
    console.log('  2. Set: MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sree_annapurna?retryWrites=true&w=majority');
    console.log('  3. Re-run: node database/scripts/migrate-product-stock.js');
    console.log('\n✓ In the meantime, local offline fallback is 100% active with stock=50 for all products.\n');
    process.exit(0);
  }

  // Sanitize URI for safe logging
  const safeUri = uri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/i, 'mongodb$1://$2:***@');
  console.log(`[1/4] Connecting to MongoDB Atlas (${safeUri})...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✓ Successfully connected to MongoDB Atlas!');

    // Step 3: Seed / Update Brands
    if (fs.existsSync(brandsSeedPath)) {
      const brandsData = JSON.parse(fs.readFileSync(brandsSeedPath, 'utf8'));
      console.log(`[2/4] Ensuring ${brandsData.length} genuine brand identities are present...`);
      for (const b of brandsData) {
        await Brand.findOneAndUpdate({ id: b.id }, b, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
      console.log(`✓ Brands verified (${brandsData.length} brands).`);
    }

    // Step 4: Upsert & Update Products
    console.log('[3/4] Updating existing product availability and stock in Atlas...');
    // Bulk update all existing products to be active, available, and have stock >= 50
    const updateResult = await Product.updateMany(
      {},
      [
        {
          $set: {
            active: true,
            isAvailable: true,
            inStock: true,
            stock: {
              $cond: {
                if: { $or: [{ $eq: ['$stock', null] }, { $lt: ['$stock', 50] }] },
                then: 50,
                else: '$stock',
              },
            },
          },
        },
      ]
    );
    console.log(`✓ Modified ${updateResult.modifiedCount || updateResult.matchedCount || 0} existing products in Atlas.`);

    // If there are canonical products in seed not yet in DB, upsert them
    if (fs.existsSync(seedPath)) {
      const canonicalProducts = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      let upsertCount = 0;
      for (const p of canonicalProducts) {
        const itemToSave = {
          ...p,
          stock: Math.max(typeof p.stock === 'number' ? p.stock : 0, 50),
          active: true,
          isAvailable: true,
          inStock: true,
        };
        await Product.findOneAndUpdate(
          { id: p.id },
          { $set: itemToSave },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        upsertCount++;
      }
      console.log(`✓ Upserted ${upsertCount} canonical products into Atlas.`);
    }

    // Step 5: Verification
    console.log('[4/4] Verifying production database state...');
    const allProducts = await Product.find({}).lean();
    const availableCount = allProducts.filter(
      (p) => p.active !== false && p.isAvailable !== false && p.inStock !== false && (p.stock || 0) > 0
    ).length;

    console.log('\n======================================================');
    console.log('🎉 PRODUCT AVAILABILITY MIGRATION COMPLETE!');
    console.log(`Total Products in Atlas:     ${allProducts.length}`);
    console.log(`Available for Order:         ${availableCount} / ${allProducts.length}`);
    console.log(`Minimum Stock Level:         ${Math.min(...allProducts.map((p) => p.stock || 0))}`);
    console.log('Sample Products in Atlas:');
    allProducts.slice(0, 5).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.id}] ${p.name}`);
      console.log(`     Stock: ${p.stock} | active: ${p.active} | isAvailable: ${p.isAvailable} | inStock: ${p.inStock}`);
    });
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runMigration();
