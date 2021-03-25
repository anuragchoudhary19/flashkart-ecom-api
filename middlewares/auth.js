const admin = require('../firebase/index');
const User = require('../models/user');

exports.authCheck = async (req, res, next) => {
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken);
    req.user = firebaseUser;
    next();
  } catch (err) {
    console.log('Auth Error', err);
    res.status(400).send({
      err: err.errorInfo.code,
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).exec();
  if (user.role !== 'admin') {
    res.status(403).json({
      err: 'Admin resource.Access denied.',
    });
  } else {
    next();
  }
};
