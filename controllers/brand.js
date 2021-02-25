const Brand = require('../models/brand');
const Product = require('../models/product');
const slugify = require('slugify');

exports.create = async (req, res) => {
  const { name } = req.body;
  try {
    const brand = await new Brand({ name, slug: slugify(name).toLowerCase() }).save();
    res.json(brand);
  } catch (err) {
    res.json(err);
    res.status(400).send('Brand cannot be created');
  }
};

exports.read = async (req, res) => {
  let brand = await Brand.findOne({ slug: req.params.slug }).exec();
  res.json(brand);
};

exports.update = async (req, res) => {
  const { name } = req.body;
  console.log(req.body);
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
    console.log(err);
    res.status(400).send('Update brand failed');
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
  const brands = await Brand.find({}).sort({ createdAt: 1 }).populate('products').exec();
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
