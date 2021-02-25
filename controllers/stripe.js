const User = require('../models/user');
const Cart = require('../models/cart');

const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  //later apply coupons
  //later calculate price
  //find user
  const user = await User.findOne({ email: req.user.email }).exec();
  //get user cart total
  const { cartTotalAfterDiscount } = await Cart.findOne({ orderedBy: user._id }).exec();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: cartTotalAfterDiscount * 100,
    currency: 'INR',
  });
  console.log(paymentIntent);
  res.send({ clientSecret: paymentIntent.client_secret });
};
