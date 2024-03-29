const User = require('../models/user');
const Cart = require('../models/cart');
const Order = require('../models/order');

const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  //later apply coupons
  //later calculate price
  //find user
  //get user cart total
  const { cartTotalAfterDiscount } = await Cart.findOne({ orderedBy: req.user._id }).exec();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: cartTotalAfterDiscount * 100,
    currency: 'INR',
  });
  // console.log(paymentIntent);
  res.send({ clientSecret: paymentIntent.client_secret });
};

// exports.refundPayment = async (req, res) => {
//   //get user cart total
//   const order = await Order.findOne({ orderedBy: req.user._id }).exec();

//   const refund = await stripe.refunds.create({
//    payment_intent=''
//   });
//   console.log(paymentIntent);
//   res.send({ clientSecret: paymentIntent.client_secret });
// };
