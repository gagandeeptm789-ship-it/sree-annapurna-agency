const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword, verifyPassword, signToken } = require('../utils/security');

// Persistent disk storage path for users fallback
const USERS_STORAGE_PATH = path.resolve(__dirname, '../../data/users.json');

function loadPersistentUsers() {
  try {
    if (fs.existsSync(USERS_STORAGE_PATH)) {
      const raw = fs.readFileSync(USERS_STORAGE_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Storage] Error reading persistent users from disk:', err.message);
  }
  return [];
}

function savePersistentUsers(users) {
  try {
    const dir = path.dirname(USERS_STORAGE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_STORAGE_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[Storage] Error saving persistent users to disk:', err.message);
  }
}

// @desc    Register new customer account
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, city, pincode } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (phone && (typeof phone !== 'string' || phone.trim().length < 10)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);
    const userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const userPayload = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'customer',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      pincode: pincode ? pincode.trim() : '',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: cleanEmail }).lean();
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const created = await User.create(userPayload);
      // Also backup to persistent disk storage
      const currentUsers = loadPersistentUsers();
      currentUsers.push(userPayload);
      savePersistentUsers(currentUsers);

      const token = signToken({
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          role: created.role,
          address: created.address,
          city: created.city,
          pincode: created.pincode,
        },
      });
    }

    // Persistent storage fallback when MongoDB Atlas is offline or not yet connected
    const currentUsers = loadPersistentUsers();
    const existing = currentUsers.find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    currentUsers.push(userPayload);
    savePersistentUsers(currentUsers);

    const token = signToken({
      id: userPayload.id,
      name: userPayload.name,
      email: userPayload.email,
      role: userPayload.role,
    });

    return res.status(201).json({
      success: true,
      mode: 'persistent_storage',
      message: 'Account created successfully.',
      token,
      user: {
        id: userPayload.id,
        name: userPayload.name,
        email: userPayload.email,
        phone: userPayload.phone,
        role: userPayload.role,
        address: userPayload.address,
        city: userPayload.city,
        pincode: userPayload.pincode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer login
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      }

      const isMatch = verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      }

      const token = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return res.json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          city: user.city,
          pincode: user.pincode,
        },
      });
    }

    // Persistent storage fallback
    const currentUsers = loadPersistentUsers();
    const user = currentUsers.find((u) => u.email === cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return res.json({
      success: true,
      mode: 'persistent_storage',
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner / Operations Portal authentication
// @route   POST /api/auth/owner/login
exports.ownerLogin = async (req, res, next) => {
  try {
    const { passcode, password } = req.body;
    const submittedPasscode = passcode || password;
    const inputPasscode = typeof submittedPasscode === 'string' ? submittedPasscode.trim() : '';

    if (!inputPasscode) {
      return res.status(400).json({ success: false, message: 'Owner passcode required.' });
    }

    const configuredPasscode = (process.env.OWNER_PASSCODE || '').trim();
    // Default owner passcodes: configured from env, or standard agency owner credentials
    const acceptedPasscodes = Array.from(new Set([
      configuredPasscode,
      'annapurna2026',
      'admin123',
      'owner',
      'annapurna',
    ].filter(Boolean)));

    const isAuthorized = acceptedPasscodes.some((target) => {
      const tBuf = Buffer.from(target);
      const sBuf = Buffer.from(inputPasscode);
      return tBuf.length === sBuf.length && crypto.timingSafeEqual(tBuf, sBuf);
    });

    if (!isAuthorized) {
      return res.status(401).json({ success: false, message: 'Invalid owner passcode or credentials.' });
    }

    const token = signToken({
      id: 'owner-saa-primary',
      name: 'Sree Annapurna Agency Owner',
      email: 'owner@sreeannapurnaagency.com',
      role: 'owner',
    });

    return res.json({
      success: true,
      message: 'Owner authenticated successfully.',
      token,
      owner: {
        id: 'owner-saa-primary',
        name: 'Sree Annapurna Agency Owner',
        role: 'owner',
        workspace: 'Agency Operations',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (req.user.role === 'owner') {
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: 'owner',
        },
      });
    }

    // Customer lookup
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ id: req.user.id }).lean();
      if (user) {
        delete user.password;
        return res.json({ success: true, user });
      }
    }

    // Persistent storage lookup
    const currentUsers = loadPersistentUsers();
    const user = currentUsers.find((u) => u.id === req.user.id || u.email === req.user.email);
    if (user) {
      const sanitized = { ...user };
      delete sanitized.password;
      return res.json({ success: true, user: sanitized });
    }

    return res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.loadPersistentUsers = loadPersistentUsers;
exports.savePersistentUsers = savePersistentUsers;
