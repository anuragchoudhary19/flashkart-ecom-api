const User = require('../models/user');
const Cart = require('../models/cart');
const SavedForLater = require('../models/savedForLater');
const { populate } = require('../models/user');

const prepareCart = (productsArray) => {
  let cartTotal = 0,
    cartTotalAfterDiscount = 0,
    products = [];
  productsArray.forEach((item) => {
    cartTotal += item.price * item.count;
    cartTotalAfterDiscount += item.price * (1 - parseInt(item.discount) / 100) * item.count;
    products.push({
      product: item._id,
      count: parseInt(item.count),
      price: parseInt(item.price),
      discount: parseInt(item.discount),
    });
  });
  return { products, cartTotal, cartTotalAfterDiscount };
};
const recalculate = (productsArray) => {
  let cartTotal = 0,
    cartTotalAfterDiscount = 0;
  productsArray.forEach((item) => {
    cartTotal += item.price * item.count;
    cartTotalAfterDiscount += item.price * (1 - parseInt(item.discount) / 100) * item.count;
  });
  return {
    products: productsArray,
    cartTotal,
    cartTotalAfterDiscount,
  };
};
const update = (products, item_id, operation) => {
  products.forEach((item, i) => {
    let updated_item = {};
    if (item.product._id == item_id) {
      if (operation === 'add') {
        updated_item = {
          ...item,
          count: item.count + 1,
        };
        products.splice(i, 1, updated_item);
      }
      if (operation === 'subtract') {
        updated_item = { ...item, count: item.count - 1, price: item.price + item.price / item.count };
        products.splice(i, 1, updated_item);
      }
      if (operation === 'remove' || operation === 'save') {
        products.splice(i, 1);
        if (products.length === 0) {
          return {
            products: [],
            cartTotal: 0,
            cartTotalAfterDiscount: 0,
          };
        }
      }
    }
  });
  const updatedCart = recalculate(products);
  return updatedCart;
};

exports.addToCart = async (req, res) => {
  const { cart } = req.body;
  console.log(cart);
  try {
    const user = await User.findOne({ email: req.user.email }).exec();
    let cartExistByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();
    if (cartExistByThisUser) {
      cartExistByThisUser.remove();
    }
    const preparedCart = prepareCart(cart);
    let newCart = await new Cart({
      ...preparedCart,
      orderedBy: user._id,
    }).save();

    const updatedUser = await User.findOneAndUpdate({ email: req.user.email }, { cart: newCart._id }, { new: true });
    if (updatedUser) {
      res.json({ successful: true });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.getCart = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).exec();
    const userCart = await Cart.findOne({ orderedBy: user._id }).populate('products.product').exec();
    res.json(userCart);
    console.log(userCart);
  } catch (error) {
    console.log(error);
  }
};

exports.updateCart = async (req, res) => {
  const { email, item_id, operation, color } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email });
    const cart = await Cart.findOne({ orderedBy: user._id }).populate('products.product').lean().exec();
    const newCart = update(cart.products, item_id, operation, color);
    const updatedCart = await Cart.findOneAndUpdate({ _id: cart._id }, { ...newCart }, { new: true });
    res.json(updatedCart);
  } catch (err) {
    console.log(err);
  }
};

exports.saveForLater = async (req, res) => {
  console.log(req.body);
  const { email, item } = req.body;
  let products = [];
  products.push({
    product: item._id,
    count: parseInt(item.count),
    price: parseInt(item.price),
    discount: parseInt(item.discount),
  });
  try {
    const user = await User.findOne({ email }).exists('savedForLater').exec();
    if (user) {
      const saved = await SavedForLater.findOneAndUpdate(
        { _id: user.savedForLater },
        { ...products },
        { new: true }
      ).exec();
      res.json(saved);
      console.log(saved);
    } else {
      const saved = await new SavedForLater({ products }).save();
      const user = await User.findOneAndUpdate({ email }, { savedForLater: saved._id }, { new: true }).exec();
      res.json(saved);
      console.log(saved);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.emptyCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  const cart = await Cart.findOneAndRemove({ orderedBy: user._id }).exec();
  res.json(cart);
};
