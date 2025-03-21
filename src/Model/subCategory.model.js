const mongoose = require("mongoose");

const { Schema } = mongoose;

const subCatgorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true,
      index: true,
      unique: true,
    },
    image: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const subCategory = mongoose.model("subCategory", subCatgorySchema);

module.exports = subCategory;
