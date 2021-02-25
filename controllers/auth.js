const User = require('../models/user');

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
  User.findOne({ email: req.user.email })
    .populate('cart')
    .exec((err, user) => {
      console.log(user);
      if (err) throw new Error(err);
      res.json(user);
    });
};
