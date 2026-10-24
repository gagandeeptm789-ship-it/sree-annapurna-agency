const express = require('express');
const router = express.Router();
const { register, login, ownerLogin, getMe } = require('../controllers/authController');
const { protectCustomer } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/owner/login', ownerLogin);
router.get('/me', protectCustomer, getMe);

module.exports = router;

