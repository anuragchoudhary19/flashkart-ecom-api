const User = require('../models/user');
const Cart = require('../models/cart');
const ProductProfile = require('../models/productProfile');

const prepareCart = async (p) => {
  let cartTotal = 0,
    cartTotalAfterDiscount = 0,
    products = [];
  for (let i = 0; i < p.length; i++) {
    let product = await ProductProfile.findOne({ _id: p[i]._id }).exec();
    cartTotal += product.price * p[i].count;
    cartTotalAfterDiscount += product.price * (1 - parseInt(product.discount) / 100) * p[i].count;
    products.push({
      product: product._id,
      count: parseInt(p[i].count),
      price: parseInt(product.price),
      discount: parseInt(product.discount),
    });
  }
  return { products, cartTotal, cartTotalAfterDiscount };
};

const recalculate = (products) => {
  let cartTotal = 0,
    cartTotalAfterDiscount = 0;
  products.forEach((item) => {
    cartTotal += item.price * item.count;
    cartTotalAfterDiscount += item.price * (1 - parseInt(item.discount) / 100) * item.count;
  });
  return { products, cartTotal, cartTotalAfterDiscount };
};
const updateCartHandle = (products, id, operation) => {
  let updatedProducts = [...products];
  for (let i = 0; i < updatedProducts.length; i++) {
    let updatedItem;
    if (updatedProducts[i].product.toString() === id.toString()) {
      if (operation === 'add') {
        updatedItem = {
          ...updatedProducts[i],
          count: updatedProducts[i].count + 1,
        };
        updatedProducts.splice(i, 1, updatedItem);
      }
      if (operation === 'subtract') {
        updatedItem = {
          ...updatedProducts[i],
          count: updatedProducts[i].count - 1,
        };
        updatedProducts.splice(i, 1, updatedItem);
      }
      if (operation === 'remove' || operation === 'save') {
        updatedProducts.splice(i, 1);
      }
      const updatedCart = recalculate(updatedProducts);
      return updatedCart;
    }
  }
};

exports.addToCart = async (req, res) => {
  const { products } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email }).exec();
    let cartExistByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();
    if (cartExistByThisUser) {
      cartExistByThisUser.remove();
    }
    const newCart = await prepareCart(products);
    const cart = await new Cart({
      ...newCart,
      orderedBy: user._id,
    }).save();
    const updatedUser = await User.findOneAndUpdate(
      {
        email: req.user.email,
      },
      {
        cart: cart._id,
      },
      { new: true }
    );
    console.log(updatedUser);
    if (updatedUser) {
      res.json({ added: true });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.getCart = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).exec();
    const userCart = await Cart.findOne({ orderedBy: user._id }).populate('products.product').exec();
    console.log(userCart);
    res.json(userCart);
  } catch (error) {
    console.log(error);
  }
};

exports.updateCart = async (req, res) => {
  const { id, operation } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    const cart = await Cart.findOne({ orderedBy: user._id }).lean().exec();
    const newCart = updateCartHandle(cart.products, id, operation);
    const updatedCart = await Cart.findOneAndUpdate(
      {
        _id: cart._id,
      },
      {
        ...newCart,
        orderedBy: user._id,
      },
      { new: true }
    );
    const updateUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { cart: updatedCart._id },
      { new: true }
    ).exec();
    if (updatedCart) {
      res.json(updatedCart);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.saveForLater = async (req, res) => {
  const { saved } = req.body;
  let products = [];
  saved.forEach((item) => {
    products.push({
      product: item._id,
      count: parseInt(item.count),
      price: parseInt(item.price),
      discount: parseInt(item.discount),
    });
  });
  try {
    const userFound = await User.findOne({ email: req.user.email }).exec();
    if (userFound) {
      const updatedUser = await User.findOneAndUpdate(
        {
          email: req.user.email,
        },
        {
          savedForLater: products,
        },
        { new: true }
      ).exec();
      res.json({ savedForLater: true });
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
