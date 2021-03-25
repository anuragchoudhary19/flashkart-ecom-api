const Brand = require('../models/brand');
const Product = require('../models/product');
const slugify = require('slugify');

exports.create = async (req, res) => {
  const { name } = req.body;
  try {
    const brand = await new Brand({ name, slug: slugify(name).toLowerCase() }).save();
    res.json(brand);
  } catch (err) {
    if (err.codeName === 'DuplicateKey') {
      res.json('Duplicate brand name not allowed');
    } else {
      res.json(err);
    }
  }
};

exports.read = async (req, res) => {
  let brand = await Brand.findOne({ slug: req.params.slug }).exec();
  res.json(brand);
};

exports.update = async (req, res) => {
  console.log(res);
  const { name } = req.body;
  try {
    // if (oldCategory !== category) {
    //   const removedCategory = Brand.findOneAndUpdate(
    //     { slug: req.params.slug },
    //     { $pull: { category: oldCategory } },
    //     { new: true }
    //   ).exec();
    //   console.log(removedCategory);
    // }
    const updated = await Brand.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
    console.log(updated);
  } catch (err) {
    if (err.codeName === 'DuplicateKey') {
      res.status(400).send('Duplicate brand name not allowed');
    } else {
      res.status(400).send(err);
    }
  }
};
exports.remove = async (req, res) => {
  try {
    const deleted = await Brand.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    res.status(400).json('Deletion of brand failed');
  }
};
exports.list = async (req, res) => {
  const brands = await Brand.find({})
    .sort({ createdAt: 1 })
    .populate('products')
    .populate({ path: 'products', populate: { path: 'profile' } })
    .exec();
  res.json(brands);
};

exports.listBrandsProductProfile = async (req, res) => {
  const brands = await Brand.find({})
    .sort({ createdAt: 1 })
    .populate('products')
    .populate({ path: 'products', populate: { path: 'profile' } })
    .exec();
  res.json(brands);
};

// exports.getSubs = async (req, res) => {
//   try {
//     const subs = await Product.find({ parent: req.params._id }).exec();
//     res.json(subs);
//   } catch (err) {
//     res.status(400).json('Get subs failed');
//   }
// };
