const Category = require('../models/category');
const Brand = require('../models/brand');
const slugify = require('slugify');

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({ name, slug: slugify(name).toLowerCase() }).save();
    res.json(category);
  } catch (err) {
    res.json(err);
    if (err.code === 11000) {
      res.status(400).send('Category already exist');
    } else {
      res.status(400).send('Category cannot be created');
    }
  }
};
exports.read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec();
  res.json(category);
};

exports.update = async (req, res) => {
  const { name } = req.body;
  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).send('Update category failed');
  }
};
exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    res.status(400).json('Deletion failed');
  }
};
exports.list = async (req, res) => {
  const category = await Category.find({}).sort({ createdAt: 1 }).exec();
  res.json(category);
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ category: req.params._id }).populate('category').exec();
    res.json(brands);
    console.log(brands);
  } catch (err) {
    console.log(err);
    res.status(400).json('Get brands failed');
  }
};
