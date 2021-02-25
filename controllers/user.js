const User = require('../models/user');
const Order = require('../models/order');
const Cart = require('../models/cart');
const ProductProfile = require('../models/productProfile');

exports.addAddress = async (req, res) => {
  const { address } = req.body;
  console.log(address);
  try {
    const user = await User.findOneAndUpdate({ email: req.user.email }, { $push: { address } }, { new: true });
    res.json({ saved: true });
  } catch (e) {
    console.log(e);
  }
};

exports.createOrder = async (req, res) => {
  const { paymentIntent } = req.body.stripeResponse;
  const user = await User.findOne({ email: req.user.email }).exec();
  let { products } = await Cart.findOne({ orderedBy: user._id }).exec();
  let newOrder = await new Order({ products, paymentIntent, orderedBy: user._id }).save();

  //decrement quanlity increment sold
  let bulkOptions = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });
  let updated = await ProductProfile.bulkWrite(bulkOptions, {});
  console.log('decrement quanlity increment sold----->', updated);
  res.json({ ok: true });
};

exports.getOrders = async (req, res) => {
  console.log(req.user);
  let user = await User.findOne({ email: req.user.email }).exec();
  console.log(user);
  let userOrders = await Order.find({ orderedBy: user._id }).populate('products.product').exec();
  console.log(userOrders);
  res.json(userOrders);
};

// addToWishlist, wishlist, removeFromWishList,
exports.addToWishlist = async (req, res) => {
  console.log(req.body);
  const { productId } = req.body;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } },
    { new: true }
  );
  if (user) {
    console.log(user);
    res.json({ ok: true });
  }
};
exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email }).select('wishlist').populate('wishlist').exec();
  res.json(list);
};
exports.removeFromWishList = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } },
    { new: true }
  );
  if (user) {
    res.json({ ok: true });
  }
};
