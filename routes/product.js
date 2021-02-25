const express = require('express');

const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controller
const { create, read, update, remove, list, listByCount } = require('../controllers/product');

//routes
router.post('/product', authCheck, adminCheck, create);
router.get('/product/:slug', read);
router.put('/product/:slug', authCheck, adminCheck, update);
router.delete('/product/:slug', authCheck, adminCheck, remove);
router.get('/products', list);
// router.get('/products/:count', listByCount);

module.exports = router;
