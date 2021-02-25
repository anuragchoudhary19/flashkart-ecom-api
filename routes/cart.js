const express = require('express');

const router = express.Router();

//middlewares

const { authCheck } = require('../middlewares/auth');
//controller
const { addToCart, updateCart, saveForLater, getCart, emptyCart } = require('../controllers/cart');

router.post('/user/cart', authCheck, addToCart);
router.get('/user/cart', authCheck, getCart);
router.post('/user/updateCart', authCheck, updateCart);
router.post('/user/saveForLater', authCheck, saveForLater);
router.delete('/user/cart', authCheck, emptyCart);

// router.get('/testing', mymiddleware, (req, res) => {
//   res.json({
//     data: 'U got the response from middleware',
//   });
// });

module.exports = router;
