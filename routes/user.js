const express = require('express');

const router = express.Router();

//middlewares
const { authCheck } = require('../middlewares/auth');

//controllers
const {
  addAddress,
  createOrder,
  getOrders,
  addToWishlist,
  wishlist,
  removeFromWishList,
} = require('../controllers/user');

router.post('/user/addAddress', authCheck, addAddress);
//orders
router.post('/user/order', authCheck, createOrder);
router.get('/user/order', authCheck, getOrders);
//wishlist
router.post('/user/wishlist', authCheck, addToWishlist);
router.get('/user/wishlist', authCheck, wishlist);
router.put('/user/wishlist', authCheck, removeFromWishList);

module.exports = router;
