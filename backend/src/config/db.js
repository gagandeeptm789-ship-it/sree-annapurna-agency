const mongoose = require('mongoose');

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;
  const uri = (rawUri || '').trim().replace(/^["']|["']$/g, '');

  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not configured in backend/.env. Running with persistent file storage cache (backend/data/).');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} (Host: ${conn.connection.host})`);

    // Ensure canonical catalogue is populated in Atlas if collection is empty
    try {
      const { ensureCanonicalCatalogue } = require('../utils/catalogueSeeder');
      ensureCanonicalCatalogue().catch((err) => {
        console.warn('[MongoDB] Catalogue check warning:', err.message);
      });
    } catch {
      // Non-blocking
    }

    return conn;
  } catch (err) {
    // Sanitize message so credentials are never leaked in logs
    const safeMsg = (err.message || '').replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb$1://***:***@');
    console.error(`[MongoDB] Connection error: ${safeMsg}`);
    console.warn('[MongoDB] Operating with local persistent file storage fallback until connection is restored.');
    // Do not crash server in development if DB is temporarily unreachable
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;

