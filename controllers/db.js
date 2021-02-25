const mongoose = require('mongoose');
require('dotenv').config();

exports.listDB = async (req, res) => {
  //db
  try {
    const result = await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log(result.models);
    res.json(result.modelSchemas);
  } catch (err) {
    console.log(err);
  }
};
