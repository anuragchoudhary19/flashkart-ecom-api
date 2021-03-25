const Product = require('../models/product');
const Brand = require('../models/brand');
const slugify = require('slugify');

exports.create = async (req, res) => {
  try {
    const { name, brand } = req.body;
    const product = await new Product({ name, brand, slug: slugify(name).toLowerCase() }).save();
    const brandUpdate = await Brand.findByIdAndUpdate(
      { _id: product.brand._id },
      { $addToSet: { products: product._id } },
      { new: true }
    );
    console.log(product, brandUpdate);
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(400).send('Create product failed');
  }
};
exports.read = async (req, res) => {
  let product = await Product.findOne({ slug: req.params.slug }).populate('brand').exec();
  res.json(product);
};

exports.update = async (req, res) => {
  const { name, brand } = req.body;
  try {
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      { name, brand, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    res.status(400).json('Deletion failed');
  }
};
exports.list = async (req, res) => {
  const sub = await Product.find({}).sort({ createdAt: -1 }).populate('brand').exec();
  res.json(sub);
};
