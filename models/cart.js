const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cartSchema = new mongoose.Schema(
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
    orderedBy: { type: ObjectId, ref: 'User' },
    address: {
      name: String,
      mobile: Number,
      address: String,
      city: String,
      pincode: Number,
      state: String,
    },
    coupon: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
