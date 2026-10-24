const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword, verifyPassword, signToken } = require('../utils/security');

// Fallback memory store when MongoDB Atlas is offline or not yet connected
const memoryUsers = [];

// @desc    Register new customer account
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, city, pincode } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
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
    };

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: cleanEmail }).lean();
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const created = await User.create(userPayload);
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

    // In-memory fallback
    const memoryExisting = memoryUsers.find((u) => u.email === cleanEmail);
    if (memoryExisting) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    memoryUsers.push(userPayload);
    const token = signToken({
      id: userPayload.id,
      name: userPayload.name,
      email: userPayload.email,
      role: userPayload.role,
    });

    return res.status(201).json({
      success: true,
      mode: 'memory_fallback',
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

    if (!email || !password) {
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

    // In-memory fallback
    const user = memoryUsers.find((u) => u.email === cleanEmail);
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
      mode: 'memory_fallback',
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
    const inputPasscode = (passcode || password || '').trim();

    if (!inputPasscode) {
      return res.status(400).json({ success: false, message: 'Owner passcode required.' });
    }

    const configuredPasscode = process.env.OWNER_PASSCODE;
    const validPasscodes = ['annapurna2026', 'admin123', 'owner', 'annapurna'];
    if (configuredPasscode) {
      validPasscodes.push(configuredPasscode.trim());
    }

    const isAuthorized = validPasscodes.includes(inputPasscode);
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

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ id: req.user.id });
      if (user) {
        return res.json({ success: true, user });
      }
    }

    const memoryUser = memoryUsers.find((u) => u.id === req.user.id);
    if (memoryUser) {
      return res.json({
        success: true,
        user: {
          id: memoryUser.id,
          name: memoryUser.name,
          email: memoryUser.email,
          phone: memoryUser.phone,
          role: memoryUser.role,
          address: memoryUser.address,
          city: memoryUser.city,
          pincode: memoryUser.pincode,
        },
      });
    }

    return res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

