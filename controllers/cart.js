const User = require('../models/user');
const Cart = require('../models/cart');
const ProductProfile = require('../models/productProfile');

const getCartTotal = (items) => {
  let cartTotal = 0;
  let cartTotalAfterDiscount = 0;
  for (let i = 0; i < items.length; i++) {
    let totalPrice = parseInt(items[i].product.price) * items[i].count;
    cartTotal += totalPrice;
    cartTotalAfterDiscount += totalPrice * (1 - parseInt(items[i].product.discount) / 100);
  }
  return { cartTotal, cartTotalAfterDiscount };
};

exports.addToCart = async (req, res) => {
  const { id } = req.body;
  try {
    var product = await ProductProfile.findOne({ _id: id }).exec();
    const cart = await Cart.findOne({ orderedBy: req.user._id }).exec();
    if (cart !== null) {
      const { products } = cart;
      let itemAlreadyInCart = false;
      if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
          if (products[i].product._id.toString() === id.toString()) {
            itemAlreadyInCart = true;
            return;
          }
        }
        if (itemAlreadyInCart) {
          return res.json(cart);
        } else {
          let products = [...cart.products];
          products.push({ product: product, count: 1 });
          let { cartTotal, cartTotalAfterDiscount } = getCartTotal(products);
          cart.products.push({ product: id, count: 1 });
          cart.cartTotal = cartTotal;
          cart.cartTotalAfterDiscount = cartTotalAfterDiscount;
        }
      } else {
        let products = [{ product: product, count: 1 }];
        let { cartTotal, cartTotalAfterDiscount } = getCartTotal(products);
        cart.products.push({ product: id, count: 1 });
        cart.cartTotal = cartTotal;
        cart.cartTotalAfterDiscount = cartTotalAfterDiscount;
      }
      let updatedCart = await Cart.findOneAndUpdate(
        { orderedBy: req.user._id },
        { products: cart.products, cartTotal: cart.cartTotal, cartTotalAfterDiscount: cart.cartTotalAfterDiscount },
        { new: true }
      )
        .select('-_id products cartTotal cartTotalAfterDiscount coupon')
        .populate('products.product', 'title slug price discount images');
      console.log(new Date());
      return res.json(updatedCart);
    } else {
      let products = [
        {
          product: id,
          count: 1,
        },
      ];
      const cart = await new Cart({
        products,
        cartTotal: product.price,
        cartTotalAfterDiscount: product.price * (1 - parseInt(product.discount) / 100),
        orderedBy: req.user._id,
      }).save();
      await User.findByIdAndUpdate(req.user._id, {
        cart: cart._id,
      });
      const newCart = await Cart.findOne({ orderedBy: req.user._id })
        .select('-_id products cartTotal cartTotalAfterDiscount coupon')
        .populate('products.product', 'title slug price discount images')
        .exec();
      return res.json(newCart);
    }
  } catch (err) {
    console.log(err);
  }
};
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ orderedBy: req.user._id })
      .select('-_id products cartTotal cartTotalAfterDiscount coupon')
      .populate('products.product', 'title slug price discount images')
      .exec();
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};
exports.getCartValue = async (req, res) => {
  const { items } = req.body;
  try {
    const productProfiles = await ProductProfile.find({ _id: { $in: items.map((i) => i._id) } })
      .select('title slug price discount images')
      .exec();
    const products = productProfiles.map((profile) => ({
      product: profile,
      count: items.find((i) => {
        if (i._id.toString() === profile._id.toString()) {
          return i.count;
        }
      }).count,
    }));
    let { cartTotal, cartTotalAfterDiscount } = getCartTotal(products);
    let cart = { products, cartTotal, cartTotalAfterDiscount };
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};

const updateCartHandle = (cart, id, operation) => {
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].product._id.toString() === id.toString()) {
      if (operation === 'add') {
        cart.products[i].count += 1;
      }
      if (operation === 'subtract') {
        cart.products[i].count -= 1;
        if (cart.products[i].count === 0) {
          cart.products.splice(i, 1);
        }
      }
      if (operation === 'remove' || operation === 'save') {
        cart.products.splice(i, 1);
      }
      return cart;
    }
  }
};

exports.updateCart = async (req, res) => {
  const { id, operation } = req.body;
  try {
    const cart = await Cart.findOne({ orderedBy: req.user._id })
      .select('products cartTotal cartTotalAfterDiscount coupon')
      .populate('products.product', 'title slug price discount images')
      .exec();
    const newCart = updateCartHandle(cart, id, operation);
    const { cartTotal, cartTotalAfterDiscount } = getCartTotal(newCart.products);
    newCart.cartTotal = cartTotal;
    newCart.cartTotalAfterDiscount = cartTotalAfterDiscount;
    console.log(newCart);
    await cart.updateOne(newCart);
    res.json(cart);
  } catch (err) {
    console.log(err);
  }
};

// exports.saveForLater = async (req, res) => {
//   const { saved } = req.body;
//   let products = [];
//   saved.forEach((item) => {
//     products.push({
//       product: item._id,
//       count: parseInt(item.count),
//       price: parseInt(item.price),
//       discount: parseInt(item.discount),
//     });
//   });
//   try {
//     const userFound = await User.findOne({ email: req.user.email }).exec();
//     if (userFound) {
//       const updatedUser = await User.findOneAndUpdate(
//         {
//           email: req.user.email,
//         },
//         {
//           savedForLater: products,
//         },
//         { new: true }
//       ).exec();
//       res.json({ savedForLater: true });
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.addAddressToCart = async (req, res) => {
  const { address } = req.body;
  try {
    const user = await User.findOne({ _id: req.user._id }).exec();
    const cart = await Cart.findOneAndUpdate({ orderedBy: user._id }, { address: { ...address } }).exec();
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};
exports.emptyCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndRemove({ orderedBy: req.user._id }).exec();
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { cart: null }).exec();
    console.log(user);
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};
