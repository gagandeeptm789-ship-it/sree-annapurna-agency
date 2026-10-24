const express = require('express');
const router = express.Router();
const { getBrands, getBrandById } = require('../controllers/brandController');

router.route('/').get(getBrands);
router.route('/:id').get(getBrandById);

module.exports = router;

