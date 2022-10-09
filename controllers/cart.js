const User = require('../models/user');
const Cart = require('../models/cart');
const ProductProfile = require('../models/productProfile');

const cart = {};
const getCartTotal = (items) => {
  let total = 0;
  let totalAfterDiscount = 0;
  for (let i = 0; i < items.length; i++) {
    let totalCost = parseInt(items[i].product.price) * items[i].count;
    total += totalCost;
    totalAfterDiscount += totalCost * (1 - parseInt(items[i].product.discount) / 100);
  }
  return [total, totalAfterDiscount];
};
const addToCartIfNotPresent = (products, item) => {
  let newArray = [...products];
  let found = false;
  for (let i = 0; i < newArray.length; i++) {
    if (newArray[i].product._id.toString() === item._id.toString()) {
      found = true;
      break;
    }
  }
  if (!found) {
    newArray.push({ product: item, count: 1 });
  }
  return [newArray, found];
};

exports.addToCart = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await ProductProfile.findOne({ _id: id }).select('price discount').exec();
    const cart = await Cart.findOne({ orderedBy: req.user._id }).populate('products.product', 'price discount').exec();
    if (cart !== null) {
      const { products } = cart;
      let [newProducts, alreadyInCart] = addToCartIfNotPresent(products, product);
      if (alreadyInCart) return res.json({ alreadyInCart: true });
      let [total, totalAfterDiscount] = getCartTotal(newProducts);
      cart.products.push({ product: id, count: 1 });
      cart.cartTotal = total;
      cart.cartTotalAfterDiscount = totalAfterDiscount;
      await cart.save();
      const updatedCart = await Cart.findOne({ orderedBy: req.user._id })
        .select('-_id products cartTotal cartTotalAfterDiscount coupon')
        .populate('products.product', 'title slug price discount images');
      return res.json(updatedCart);
    } else {
      const products = [
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
    let [total, totalAfterDiscount] = getCartTotal(products);
    let cart = { products, cartTotal: total, cartTotalAfterDiscount: totalAfterDiscount };
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};

const updateProdcuts = (products, id, operation) => {
  for (let i = 0; i < products.length; i++) {
    if (products[i].product._id == id) {
      if (operation === 'add') {
        products[i].count += 1;
      } else if (operation === 'subtract') {
        products[i].count -= 1;
        if (products[i].count === 0) {
          products.splice(i, 1);
        }
      } else if (operation === 'remove' || operation === 'save') {
        products.splice(i, 1);
      }
      return products;
    }
  }
  return products;
};

exports.updateCart = async (req, res) => {
  const { id, operation } = req.body;
  try {
    const cart = await Cart.findOne({ orderedBy: req.user._id })
      .select('products cartTotal cartTotalAfterDiscount coupon')
      .populate('products.product', 'title slug price discount images')
      .exec();
    const { products } = cart;
    const updatedProducts = updateProdcuts(products, id, operation);
    if (updatedProducts.length === 0) {
      const cart = await Cart.findOneAndRemove({ orderedBy: req.user._id }).exec();
      const user = await User.findOneAndUpdate({ _id: req.user._id }, { cart: null }).exec();
      return res.json(null);
    }
    const [total, totalAfterDiscount] = getCartTotal(updatedProducts);
    cart.products = updatedProducts;
    cart.cartTotal = total;
    cart.cartTotalAfterDiscount = totalAfterDiscount;
    await cart.save();
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
    await Cart.findOneAndRemove({ orderedBy: req.user._id }).exec();
    await User.findOneAndUpdate({ _id: req.user._id }, { cart: null }).exec();
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};
