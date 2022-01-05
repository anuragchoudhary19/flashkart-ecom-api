const User = require('../models/user');
const Order = require('../models/order');
const Cart = require('../models/cart');
const ProductProfile = require('../models/productProfile');

exports.getAddress = async (req, res) => {
  try {
    const address = await User.findOne({ _id: req.user._id }).select('-_id address').exec();
    res.json(address);
  } catch (e) {
    console.log(e);
  }
};
exports.addAddress = async (req, res) => {
  const { address } = req.body;
  try {
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { $push: { address } }).exec();
    res.json({ saved: true });
  } catch (e) {
    console.log(e);
  }
};

exports.removeAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { address: { _id: id } } }, { new: true });
    res.json({ deleted: true });
  } catch (e) {
    console.log(e);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { paymentIntent } = req.body.stripeResponse;
    let { products, address, cartTotal, cartTotalAfterDiscount } = await Cart.findOne({
      orderedBy: req.user._id,
    }).exec();
    let newOrder = await new Order({
      products,
      address,
      cartTotal,
      cartTotalAfterDiscount,
      paymentIntent,
      orderedBy: req.user._id,
    }).save();
    //decrement quanlity increment sold
    if (newOrder) {
      let bulkOptions = products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      let updated = await ProductProfile.bulkWrite(bulkOptions, {});
      console.log('decrement quanlity increment sold----->', updated);
    }
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  let order = await Order.findOneAndUpdate({ _id: orderId }, { orderStatus: 'Cancelled' }).exec();
  const { products } = order;
  //decrement quanlity increment sold
  let bulkOptions = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });
  let updated = await ProductProfile.bulkWrite(bulkOptions, {});
  res.json({ ok: true });
};

exports.getOrders = async (req, res) => {
  try {
    let userOrders = await Order.find({ orderedBy: req.user._id })
      .populate('products.product')
      .sort({ createdAt: -1 })
      .exec();
    res.json(userOrders);
  } catch (error) {
    res.json({ error: error });
  }
};

// addToWishlist, wishlist, removeFromWishList,
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { wishlist: productId } }, { new: true })
    .select('-createdAt -updatedAt -__v -savedForLater -address -cart')
    .exec();
  res.json(user);
};
exports.wishlist = async (req, res) => {
  const list = await User.findOne({ _id: req.user._id }).select('wishlist').populate('wishlist').exec();
  res.json(list);
};
exports.removeFromWishList = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { wishlist: productId } }, { new: true })
    .select('-createdAt -updatedAt -__v -savedForLater -address -cart')
    .exec();
  res.json(user);
};
