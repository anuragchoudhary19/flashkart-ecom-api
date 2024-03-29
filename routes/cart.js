const express = require('express');

const router = express.Router();

// middlewares

const { authCheck } = require('../middlewares/auth');
// controller
const { addToCart, updateCart, getCart, getCartValue, emptyCart, addAddressToCart } = require('../controllers/cart');

router.post('/user/cart', authCheck, addToCart);
router.post('/user/cart/address', authCheck, addAddressToCart);
router.get('/user/cart', authCheck, getCart);
router.post('/user/cartValue', getCartValue);
router.post('/user/updateCart', authCheck, updateCart);
router.delete('/user/cart', authCheck, emptyCart);

// router.post('/user/saveForLater', authCheck, saveForLater);

module.exports = router;
