const express = require('express');

const router = express.Router();

//middlewares
const { adminCheck, authCheck } = require('../middlewares/auth');

//controllers
const {
  addAddress,
  removeAddress,
  createOrder,
  getOrders,
  addToWishlist,
  wishlist,
  removeFromWishList,
  getAddress,
} = require('../controllers/user');

const { updateOrderStatus } = require('../controllers/admin');

router.get('/user/address', authCheck, getAddress);
router.post('/user/address', authCheck, addAddress);
router.delete('/user/address/:id', authCheck, removeAddress);
//orders
router.post('/user/order', authCheck, createOrder);
router.get('/user/order', authCheck, getOrders);
router.post('/admin/order/status', adminCheck, authCheck, updateOrderStatus);
//wishlist
router.post('/user/wishlist', authCheck, addToWishlist);
router.get('/user/wishlist', authCheck, wishlist);
router.put('/user/wishlist', authCheck, removeFromWishList);

module.exports = router;
