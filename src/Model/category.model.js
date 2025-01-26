const mongoose = require("mongoose");
const { Schema } = mongoose;
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    subCategory: [
      {
        type: Schema.Types.ObjectId,
        ref: "subCategory",
      },
    ],
    product: [{ type: Schema.Types.ObjectId, ref: "product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", categorySchema);
