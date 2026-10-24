const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require('../controllers/productController');
const { protectOwner } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protectOwner, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protectOwner, updateProduct);

module.exports = router;
