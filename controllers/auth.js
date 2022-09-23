const User = require('../models/user');
let { getOrSetCache, analytics } = require('./redis');

exports.checkDuplicateEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      res.json({ duplicate: true });
    } else {
      res.json({ duplicate: false });
    }
  } catch (error) {
    res.json(error);
  }
};

exports.createOrUpdateUser = async (req, res) => {
  analytics(req.clientIp);
  const { name, picture, email } = req.user;
  try {
    const user = await User.findOneAndUpdate({ email: email }, { name: email.split('@')[0], picture }, { new: true });
    if (user) {
      res.json(user);
    } else {
      const newUser = await new User({
        email,
        name: email.split('@')[0],
        picture,
      }).save();
      res.json(newUser);
    }
  } catch (error) {
    console.log('error', error);
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await getOrSetCache(req.user.email, async () => {
      const user = await User.findOne({ _id: req.user._id }).select('-createdAt -updatedAt -__v').exec();
      return user;
    });
    return res.json(user);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
};
