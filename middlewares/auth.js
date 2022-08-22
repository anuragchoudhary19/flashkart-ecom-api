const admin = require('../firebase/index');
const User = require('../models/user');
let { getOrSetCache } = require('../controllers/redis');

exports.authCheck = async (req, res, next) => {
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken);
    let user = await getOrSetCache(firebaseUser.email, async () => {
      const user = await User.findOne({ email: firebaseUser.email }).exec();
      return user;
    });
    req.user = user;
    next();
  } catch (err) {
    if (err.errorInfo.code) {
      res.status(400).send({
        err: err.errorInfo.code,
      });
    } else {
      res.status(400).send({
        err,
      });
    }
  }
};

exports.adminCheck = async (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({
      err: 'Admin resource.Access denied.',
    });
  } else {
    next();
  }
};
