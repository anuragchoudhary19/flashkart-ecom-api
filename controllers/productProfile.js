const ProductProfile = require('../models/productProfile');
const User = require('../models/user');
const Brand = require('../models/brand');
const Product = require('../models/product');
const _ = require('lodash');
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
  const product = await ProductProfile.findOne({ slug: req.params.slug })
    .populate({ path: 'reviews', populate: { path: 'postedBy' } })
    .exec();
  res.json(product);
};

exports.update = async (req, res) => {
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
  const perPage = 4;
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
exports.related = async (req, res) => {
  const { brand, page } = req.body;
  const currentPage = page;
  const perPage = 3;
  try {
    const profiles = await ProductProfile.find({})
      .where({ brand: brand })
      .skip((currentPage - 1) * perPage)
      .populate('brand')
      .populate('product')
      .limit(perPage)
      .exec();
    res.json(profiles);
  } catch (err) {
    console.log(err);
  }
};

exports.rating = async (req, res) => {
  const product = await ProductProfile.findById(req.params.id).exec();
  const user = await User.findOne({ email: req.user.email }).exec();
  const { rating } = req.body;

  //if user has already left a rating ...then push new rating
  let existingRating = product.ratings.find((ele) => ele.postedBy.toString() === user._id.toString());

  console.log(existingRating);
  if (existingRating === undefined) {
    const ratedProduct = await ProductProfile.findByIdAndUpdate(
      req.params.id,
      {
        $push: { ratings: { stars: rating, postedBy: user._id } },
      },
      { new: true }
    ).exec();
    console.log('rating added', ratedProduct);
    res.json(ratedProduct);
  } else {
    const ratingUpdated = await ProductProfile.updateOne(
      {
        ratings: { $elemMatch: existingRating },
      },
      { $set: { 'ratings.$.stars': rating } },
      { new: true }
    );
    console.log('rating added', ratingUpdated);
    res.json(ratingUpdated);
  }
};
exports.review = async (req, res) => {
  const product = await ProductProfile.findById(req.params.id).exec();
  const user = await User.findOne({ email: req.user.email }).exec();
  const { review } = req.body;

  //if user has already left a rating ...then push new rating
  let existingReview = product.reviews.find((ele) => ele.postedBy.toString() === user._id.toString());

  if (existingReview === undefined) {
    const reviewedProduct = await ProductProfile.findByIdAndUpdate(
      req.params.id,
      {
        $push: { reviews: { review, postedBy: user._id, date: new Date().toLocaleDateString() } },
      },
      { new: true }
    ).exec();
    console.log('review added', reviewedProduct);
    res.json(reviewedProduct);
  } else {
    const reviewUpdated = await ProductProfile.updateOne(
      {
        reviews: { $elemMatch: existingReview },
      },
      { $set: { 'reviews.$.review': review, date: new Date().toLocaleDateString() } },
      { new: true }
    );
    console.log('rating added', reviewUpdated);
    res.json(reviewUpdated);
  }
};

//SEARCH/FILTER

const handleQuery = async (req, res, query) => {
  let results = [];
  let profilesBasedOnBrand = [];
  let profilesBasedOnProduct = [];
  let brand = await Brand.findOne({ $text: { $search: query } }).exec();
  if (brand) {
    profilesBasedOnBrand = await ProductProfile.find({ brand: brand._id }).exec();
  }
  let product = await Product.findOne({ $text: { $search: query } }).exec();
  if (product) {
    profilesBasedOnProduct = await ProductProfile.find({ product: product._id }).exec();
  }
  let profiles = await ProductProfile.find({ $text: { $search: query } }).exec();
  results = [...profiles, ...profilesBasedOnBrand, ...profilesBasedOnProduct];
  let uniqueProfiles = _.uniqWith(results, _.isEqual);
  res.json(uniqueProfiles);
};
const handlePrice = async (req, res, price) => {
  try {
    const result = await ProductProfile.find({
      price: { $gte: price[0], $lte: price[1] },
    }).exec();
    console.log(result);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};
const handleBrand = async (req, res, brand) => {
  try {
    const result = await ProductProfile.find({ brand }).exec();
    console.log(result);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};
const handleProduct = async (req, res, product) => {
  try {
    const result = await ProductProfile.find({ product }).exec();
    console.log(result);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};
const handleStar = async (req, res, stars) => {
  ProductProfile.aggregate([
    {
      $project: {
        document: '$$ROOT',
        floorAverage: {
          $floor: { $avg: '$ratings.stars' },
        },
      },
    },
    { $match: { floorAverage: stars } },
  ]).exec((err, aggregates) => {
    console.log(aggregates);
    if (err) console.log('Aggregate', err);
    ProductProfile.find({ _id: aggregates }).exec((err, products) => {
      if (err) console.log('Product aggregate error', err);
      res.json(products);
    });
  });
};

exports.searchFilters = async (req, res) => {
  const { query, price, brand, product, stars } = req.body;
  if (query) {
    console.log(query);
    await handleQuery(req, res, query);
  }
  //price [10,100]
  if (price !== undefined) {
    await handlePrice(req, res, price);
  }
  if (brand) {
    await handleBrand(req, res, brand);
  }
  if (product) {
    await handleProduct(req, res, product);
  }
  if (stars) {
    await handleStar(req, res, stars);
  }
};
