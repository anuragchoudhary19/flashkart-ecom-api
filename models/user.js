const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: 'subscriber',
    },
    cart: {
      type: ObjectId,
      ref: 'Cart',
    },
    savedForLater: {
      type: ObjectId,
      ref: 'ProductProfile',
    },
    wishlist: [{ type: ObjectId, ref: 'ProductProfile' }],
    address: [
      {
        name: String,
        mobile: Number,
        address: String,
        city: String,
        pincode: Number,
        state: String,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model('User', userSchema);
