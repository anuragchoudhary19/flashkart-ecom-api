const User = require('../models/user');

exports.checkDuplicateEmail = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email }).exec();
    console.log(user);
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
  const { name, picture, email } = req.user;
  try {
    const user = await User.findOneAndUpdate({ email: email }, { name: email.split('@')[0], picture }, { new: true });
    if (user) {
      console.log('USER UPDATED', user);
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
    const user = await User.findOne({ email: req.user.email }).populate('cart').populate('savedForLater').exec();
    console.log(user);
    res.json(user);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
};
