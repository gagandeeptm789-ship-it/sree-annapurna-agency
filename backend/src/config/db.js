const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not set in environment. Running in offline/in-memory mode for development.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} (Host: ${conn.connection.host})`);
    return conn;
  } catch (err) {
    // Sanitize message so credentials are never leaked in logs
    const safeMsg = (err.message || '').replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb$1://***:***@');
    console.error(`[MongoDB] Connection error: ${safeMsg}`);
    // Do not crash server in development if DB is temporarily unreachable
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;

