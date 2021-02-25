const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productProfileSchema = new mongoose.Schema(
  {
    brand: {
      type: ObjectId,
      ref: 'Brand',
    },
    product: {
      type: ObjectId,
      ref: 'Product',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    discount: {
      type: Number,
      trim: true,
      default: 0,
    },
    specification: {
      SIM: {
        type: String,
        required: true,
        trim: true,
        enum: ['SINGLE SIM', 'DUAL SIM'],
      },
      network: {
        type: String,
        required: true,
        trim: true,
        enum: ['2G', '3G', '4G', '5G'],
      },
      memory: {
        ram: {
          size: {
            type: Number,
            required: true,
            trim: true,
          },
          unit: {
            type: String,
            required: true,
            enum: ['MB', 'GB', 'TB'],
          },
        },
        rom: {
          size: {
            type: Number,
            required: true,
            trim: true,
          },
          unit: {
            type: String,
            required: true,
            enum: ['MB', 'GB', 'TB'],
          },
        },
        expandable: {
          size: {
            type: Number,
            required: true,
            trim: true,
          },
          unit: {
            type: String,
            required: true,
            enum: ['MB', 'GB', 'TB'],
          },
        },
      },
      display: {
        screen: {
          size: {
            type: Number,
            required: true,
            trim: true,
          },
          unit: {
            type: String,
            required: true,
            enum: ['cm', 'inch'],
          },
        },
        resolution: {
          type: String,
          trim: true,
          required: true,
          maxlength: 32,
        },
      },
      colors: {
        type: Array,
      },
      camera: {
        front: {
          value: {
            type: Number,
            required: true,
            trim: true,
          },
          unit: {
            type: String,
            default: 'MP',
          },
        },
        rear: {
          value: {
            type: Number,
            required: true,
            trim: true,
          },
          unit: {
            type: String,
            default: 'MP',
          },
        },
      },
      battery: {
        size: {
          type: Number,
          required: true,
          trim: true,
        },
        unit: {
          type: String,
          default: 'mAh',
        },
      },
      processor: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
      },
      OS: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
      },
    },
    quantity: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 3,
      default: 0,
    },
    sold: {
      type: Number,
      trim: true,
      default: 0,
    },
    images: {
      type: Array,
    },
    rating: [
      {
        stars: {
          type: Number,
        },
        postedBy: {
          type: ObjectId,
          ref: 'User',
        },
      },
    ],
    reviews: [
      {
        name: {
          type: String,
        },
        comment: {
          type: String,
          maxlength: 2000,
        },
        date: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductProfile', productProfileSchema);
