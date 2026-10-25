const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Connect to MongoDB Atlas (non-blocking in development)
connectDB();

// Core Middleware: Support Localhost, Network IP & Forwarded Tunnels (VS Code, ngrok, localtunnel)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' || process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    const configured = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim());
    if (configured.includes(origin)) {
      return callback(null, true);
    }
    // Allow tunnels (VS Code port forwarding, ngrok, localtunnel, cloudflare, LAN Wi-Fi IPs)
    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|.*\.app\.github\.dev|.*\.ngrok.*|.*\.loca\.lt|.*\.trycloudflare\.com)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// System Health Check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const isDbConnected = mongoose.connection.readyState === 1;
  const hasUri = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

  let dbStatus = 'disconnected';
  if (isDbConnected) {
    dbStatus = 'connected';
  } else if (!hasUri) {
    dbStatus = 'not_configured';
  } else {
    dbStatus = 'connection_failed_or_offline';
  }

  res.json({
    status: 'ok',
    service: 'Sree Annapurna Agency Backend API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    database: {
      connected: isDbConnected,
      status: dbStatus,
      host: isDbConnected ? mongoose.connection.host : null,
    },
  });
});

// Mount Resource Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

// Server Listener
const PORT = process.env.PORT || 5000;
let server = null;

if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SREE ANNAPURNA AGENCY BACKEND SERVER`);
    console.log(`📡 URL: http://0.0.0.0:${PORT} (Accessible via localhost and network/tunnels)`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection] ${err.message}`);
});

module.exports = { app, server };
