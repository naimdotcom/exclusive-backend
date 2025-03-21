const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    review: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        comment: {
          type: String,
          trim: true,
        },
        rating: {
          type: Number,
          trim: true,
        },
      },
    ],
    stock: {
      type: String,
      require: true,
    },
    size: [
      {
        type: String,
        default: "S",
        enum: ["XS", "S", "L", "M", "XL", "XXL"],
      },
    ],
    color: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      require: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "subCategory",
    },
    discount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
