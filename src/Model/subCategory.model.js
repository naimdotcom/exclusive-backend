const mongoose = require("mongoose");

const { Schema } = mongoose;

const subCatgorySchema = new Schema({
  name: {
    type: String,
    trim: true,
    require: true,
  },
  image: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "category",
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
  ],
});

const subCategory = mongoose.model("subCategory", subCatgorySchema);

module.exports = subCategory;
