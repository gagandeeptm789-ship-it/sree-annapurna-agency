const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../backend/.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set in backend/.env');
  process.exit(1);
}

async function exportCollections() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const brands = await db.collection('brands').find({}, { projection: { _id: 0, __v: 0 } }).toArray();
    const products = await db.collection('products').find({}, { projection: { _id: 0, __v: 0 } }).toArray();

    const seedDir = path.resolve(__dirname, '../seed');
    fs.writeFileSync(path.join(seedDir, 'brands.json'), JSON.stringify(brands, null, 2));
    fs.writeFileSync(path.join(seedDir, 'products.json'), JSON.stringify(products, null, 2));

    console.log(`✓ Exported ${brands.length} brands and ${products.length} products to database/seed/`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Export error:', err.message);
    process.exit(1);
  }
}

exportCollections();

