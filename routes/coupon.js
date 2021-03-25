const express = require('express');

const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controller
const { create, read, update, remove, list } = require('../controllers/coupon');

//routes
router.post('/coupon', authCheck, adminCheck, create);
// router.get('/coupon/:slug', read);
router.put('/coupon/:couponId', authCheck, adminCheck, update);
router.delete('/coupon/:couponId', authCheck, adminCheck, remove);
router.get('/coupons', list);
//router.get('/brand/products/:_id', getSubs);

module.exports = router;
