const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const savedForLaterSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: 'ProductProfile',
        },
        color: String,
        count: Number,
        price: Number,
        discount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedForLater', savedForLaterSchema);
