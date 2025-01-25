const mongoose = require("mongoose");

const { Schema } = mongoose;

const bannerSchema = new Schema({
  title: {
    type: String,
    require: true,
    trim: true,
  },
  image: {
    type: String,
    require: true,
    trim: true,
  },
});

const Banner = mongoose.model("banner", bannerSchema);
module.exports = Banner;
