const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: 'Name is required',
      minlength: [2, 'Too short'],
      maxlength: [32, 'Too long'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    products: [{ type: ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', brandSchema);
