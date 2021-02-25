const ProductProfile = require('../models/productProfile');
const Product = require('../models/product');
const slugify = require('slugify');

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new ProductProfile({ ...req.body }).save();
    const productUpdate = await Product.findByIdAndUpdate({ _id: req.body.product }, { profile: newProduct._id });
    console.log(productUpdate);
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
};

exports.listAll = async (req, res) => {
  const products = await ProductProfile.find({})
    .limit(parseInt(req.params.count))
    .populate('brand')
    .populate('product')
    .sort([['createdAt', 'desc']])
    .exec();
  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await ProductProfile.findOneAndRemove({ slug: req.params.slug }).exec();
    res.send(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send('Product delete failed');
  }
};

exports.read = async (req, res) => {
  const product = await ProductProfile.findOne({ slug: req.params.slug }).exec();
  res.json(product);
};

exports.update = async (req, res) => {
  console.log(req.body);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await ProductProfile.findOneAndUpdate({ slug: req.params.slug }, req.body, {
      new: true,
    }).exec();
    const productUpdate = await Product.findByIdAndUpdate(req.body.product, { profile: updatedProduct._id });
    console.log(updatedProduct, productUpdate);
    res.json(updatedProduct);
  } catch (err) {
    console.log(err);
    return res.status(400).send('Product Update Failed');
  }
};

exports.list = async (req, res) => {
  const { sort, order, page } = req.body;
  const currentPage = page;
  const perPage = 3;
  try {
    const profiles = await ProductProfile.find({})
      .skip((currentPage - 1) * perPage)
      .populate('brand')
      .populate('product')
      .sort([[sort, order]])
      .limit(perPage)
      .exec();
    res.json(profiles);
  } catch (err) {
    console.log(err);
  }
};
