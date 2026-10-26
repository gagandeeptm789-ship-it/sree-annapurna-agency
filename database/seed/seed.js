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

if (!uri) {
  console.error('\n❌ [Seed Error] MONGODB_URI is not configured in backend/.env');
  console.log('To seed your database:');
  console.log('1. Open backend/.env');
  console.log('2. Add your MongoDB Atlas connection string:');
  console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sree_annapurna?retryWrites=true&w=majority');
  console.log('3. Run: npm run seed:db\n');
  process.exit(1);
}

// Brand Schema
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

// Product Schema
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

const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('🌱 SREE ANNAPURNA AGENCY - DATABASE SEED SCRIPT');
  console.log('======================================================');

  try {
    console.log('[1/4] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✓ Successfully connected to MongoDB Atlas');

    // Read seed files
    const brandsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'brands.json'), 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'products.json'), 'utf8'));

    console.log(`[2/4] Seeding ${brandsData.length} genuine brands...`);
    for (const b of brandsData) {
      await Brand.findOneAndUpdate({ id: b.id }, b, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    console.log(`✓ Loaded ${brandsData.length} brands successfully`);

    console.log(`[3/4] Seeding ${productsData.length} genuine products...`);
    for (const p of productsData) {
      await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    console.log(`✓ Loaded ${productsData.length} products successfully`);

    console.log('[4/4] Verifying data integrity...');
    const brandCount = await Brand.countDocuments();
    const productCount = await Product.countDocuments();

    console.log(`\n======================================================`);
    console.log(`🎉 DATABASE SEED COMPLETED SUCCESSFULLY!`);
    console.log(`Total Brands in Atlas:   ${brandCount}`);
    console.log(`Total Products in Atlas: ${productCount}`);
    console.log(`(Zero fake orders or customers seeded - clean production ready)`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedDatabase();

