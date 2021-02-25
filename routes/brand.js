const express = require('express');

const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controller
const { create, read, update, remove, list, listBrandsProductProfile } = require('../controllers/brand');

//routes
router.post('/brand', authCheck, adminCheck, create);
router.get('/brand/:slug', read);
router.put('/brand/:slug', authCheck, adminCheck, update);
router.delete('/brand/:slug', authCheck, adminCheck, remove);
router.get('/brands', list);
router.get('/brands-product-profile', listBrandsProductProfile);
//router.get('/brand/products/:_id', getSubs);

module.exports = router;
