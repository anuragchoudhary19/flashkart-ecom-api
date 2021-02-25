const express = require('express');

const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controller
const { create, listAll, remove, read, update, list } = require('../controllers/productProfile');

//routes
router.post('/productProfile', authCheck, adminCheck, create);
router.get('/productProfiles/:count', listAll);
router.delete('/productProfile/:slug', authCheck, adminCheck, remove);
router.get('/productProfile/:slug', read);
router.put('/productProfile/:slug', authCheck, adminCheck, update);

router.post('/productProfiles', list);
module.exports = router;
