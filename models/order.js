const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: 'ProductProfile',
        },
        count: Number,
      },
    ],
    cartTotal: { type: Number, default: 0 },
    cartTotalAfterDiscount: { type: Number, default: 0 },
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: 'Not Processed',
      enum: ['Not Processed', 'Processing', 'Dispatched', 'Cancelled', 'Delivered'],
    },
    address: {
      name: String,
      mobile: Number,
      address: String,
      city: String,
      pincode: Number,
      state: String,
    },
    orderedBy: {
      type: ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
