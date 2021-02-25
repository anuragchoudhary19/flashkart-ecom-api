const express = require('express');

const router = express.Router();

//middlewares

const { authCheck, adminCheck } = require('../middlewares/auth');
//controller
const { createOrUpdateUser, currentUser } = require('../controllers/auth');

const mymiddleware = (req, res, next) => {
  console.log('middleware hello');
  next();
};
router.post('/create-or-update-user', authCheck, createOrUpdateUser);
router.post('/current-user', authCheck, currentUser);
router.post('/current-admin', authCheck, adminCheck, currentUser);

router.get('/testing', mymiddleware, (req, res) => {
  res.json({
    data: 'U got the response from middleware',
  });
});

module.exports = router;
