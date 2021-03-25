const express = require('express');

const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controller
const {
  create,
  listAll,
  remove,
  read,
  update,
  list,
  rating,
  review,
  related,
  searchFilters,
} = require('../controllers/productProfile');

//routes
router.post('/productProfile', authCheck, adminCheck, create);
router.get('/productProfiles/:count', listAll);
router.delete('/productProfile/:slug', authCheck, adminCheck, remove);
router.get('/productProfile/:slug', read);
router.put('/productProfile/:slug', authCheck, adminCheck, update);

router.post('/productProfiles', list);
router.post('/productProfiles/related-products', related);

//rating
router.post('/productProfiles/rating/:id', authCheck, rating);
router.post('/productProfiles/review/:id', authCheck, review);

//search/filter
router.post('/search/filters', searchFilters);
module.exports = router;
