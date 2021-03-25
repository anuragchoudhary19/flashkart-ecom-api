const Coupon = require('../models/coupon');

exports.create = async (req, res) => {
  try {
    const { coupon } = req.body;
    const { name, expiry, discount } = coupon;
    res.json(await new Coupon({ name, expiry, discount }).save());
  } catch (e) {
    console.log(e);
  }
};
exports.update = async (req, res) => {
  try {
    const { coupon } = req.body;
    const { newName, newExpiry, newDiscount } = coupon;
    res.json(
      await Coupon.findByIdAndUpdate(req.params.couponId, {
        name: newName,
        expiry: newExpiry,
        discount: newDiscount,
      }).exec()
    );
  } catch (e) {
    console.log(e);
  }
};
exports.remove = async (req, res) => {
  try {
    res.json(await Coupon.findByIdAndDelete(req.params.couponId).exec());
  } catch (e) {
    console.log(e);
  }
};
exports.list = async (req, res) => {
  try {
    res.json(await Coupon.find({}).sort({ createdAt: -1 }).exec());
  } catch (e) {
    console.log(e);
  }
};
