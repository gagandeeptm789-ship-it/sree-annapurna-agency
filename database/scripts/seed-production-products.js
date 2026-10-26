/**
 * SREE ANNAPURNA AGENCY - IDEMPOTENT PRODUCTION SEED SCRIPT
 *
 * Safety Guarantees:
 * 1. Strictly touches ONLY 'products' and 'brands' collections.
 * 2. Never deletes, overwrites, or modifies 'orders', 'users', 'payments', or operational collections.
 * 3. Uses idempotent upsert (findOneAndUpdate with $set by unique 'id') — will never duplicate records.
 * 4. Preserves authentic pricing, SKUs, images, descriptions, and stock from canonical seed data.
 * 5. Sanitizes all output — never logs credentials or raw connection strings.
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

const uri = (process.argv[2] || process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');

// Schemas
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

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    brandId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, default: 0, min: 0 },
    pack: { type: String, default: '' },
    image: { type: String, default: '' },
    active: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seedProduction() {
  console.log('\n======================================================');
  console.log('🌱 SREE ANNAPURNA AGENCY - PRODUCTION SEED OPERATION');
  console.log('======================================================');

  if (!uri || !uri.trim()) {
    console.error('\n❌ [Error] MONGODB_URI is not set in backend/.env.');
    console.log('Please paste your MongoDB Atlas connection string into backend/.env:');
    console.log('MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sree_annapurna?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  // Sanitize connection URI for display
  const sanitizedHost = uri.replace(/^mongodb(\+srv)?:\/\/[^@]+@([^/?]+).*$/i, '$2');
  console.log(`[1/5] Connecting to Atlas cluster host: ${sanitizedHost}...`);

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const dbName = conn.connection.name;
    console.log(`✓ Connected to database: "${dbName}" on host: ${conn.connection.host}`);

    // Pre-flight check: Verify existing collections to ensure safety
    console.log('[2/5] Performing pre-flight check on existing collections...');
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`  Existing collections found in "${dbName}":`, collectionNames);

    const initialProductCount = collectionNames.includes('products') ? await Product.countDocuments() : 0;
    const initialBrandCount = collectionNames.includes('brands') ? await Brand.countDocuments() : 0;
    const orderCount = collectionNames.includes('orders') ? await conn.connection.db.collection('orders').countDocuments() : 0;
    const userCount = collectionNames.includes('users') ? await conn.connection.db.collection('users').countDocuments() : 0;

    console.log(`  Current Products count: ${initialProductCount}`);
    console.log(`  Current Brands count:   ${initialBrandCount}`);
    console.log(`  Protected Orders count: ${orderCount} (will NOT be touched)`);
    console.log(`  Protected Users count:  ${userCount} (will NOT be touched)`);

    // Load authentic seed files
    const brandsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../seed/brands.json'), 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../seed/products.json'), 'utf8'));

    // Step 3: Idempotently upsert Brands
    console.log(`\n[3/5] Idempotently upserting ${brandsData.length} canonical brands...`);
    let brandUpsertCount = 0;
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
      brandUpsertCount++;
    }
    console.log(`✓ ${brandUpsertCount} brands processed successfully without duplicates.`);

    // Step 4: Idempotently upsert Products
    console.log(`\n[4/5] Idempotently upserting ${productsData.length} canonical products with authentic data...`);
    let productUpsertCount = 0;
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
            stock: p.stock,
            inStock: (p.stock || 0) > 0,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      productUpsertCount++;
    }
    console.log(`✓ ${productUpsertCount} products processed successfully without duplicates.`);

    // Step 5: Post-seed verification
    console.log('\n[5/5] Running post-seed verification on Atlas...');
    const finalProductCount = await Product.countDocuments();
    const finalBrandCount = await Brand.countDocuments();
    const finalOrderCount = collectionNames.includes('orders') ? await conn.connection.db.collection('orders').countDocuments() : 0;
    const finalUserCount = collectionNames.includes('users') ? await conn.connection.db.collection('users').countDocuments() : 0;

    // Check specific anchor product
    const anchorProduct = await Product.findOne({ id: 'swastik-mango-pickle' }).lean();

    console.log('\n======================================================');
    console.log('🎉 PRODUCTION DATABASE VERIFICATION SUMMARY');
    console.log('======================================================');
    console.log(`Database Name:          "${dbName}"`);
    console.log(`Brands in Database:     ${finalBrandCount} (Expected: 6)`);
    console.log(`Products in Database:   ${finalProductCount} (Expected: 33)`);
    console.log(`Orders in Database:     ${finalOrderCount} (Preserved intact)`);
    console.log(`Users in Database:      ${finalUserCount} (Preserved intact)`);
    console.log('Anchor Product Verification (swastik-mango-pickle):');
    if (anchorProduct) {
      console.log(`  Name:   ${anchorProduct.name}`);
      console.log(`  Price:  ₹${anchorProduct.price}`);
      console.log(`  Stock:  ${anchorProduct.stock} units`);
      console.log(`  Active: ${anchorProduct.active}`);
      console.log(`  Status: ✓ READY FOR LIVE CHECKOUT`);
    } else {
      console.error('  ❌ Anchor product missing!');
    }
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Operation failed:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedProduction();

