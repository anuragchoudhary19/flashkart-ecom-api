const express = require('express');

const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');
//controller
// const { listDB } = require('../controllers/db');
const { orders, updateOrderStatus } = require('../controllers/admin');

//routes
router.get('/admin/orders', authCheck, adminCheck, orders);
router.post('/admin/order/status', authCheck, adminCheck, updateOrderStatus);

// router.get('/databases', listDB);
// router.post('/current-user', authCheck, currentUser);
// router.post('/current-admin', authCheck, adminCheck, currentUser);

// router.get('/testing', mymiddleware, (req, res) => {
//   res.json({
//     data: 'U got the response from middleware',
//   });
// });

module.exports = router;
