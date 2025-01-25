const mongoose = require("mongoose");
const { Schema } = mongoose;

const flashSalesSchema = new Schema({
  title: {
    type: String,
    require: true,
    trim: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    require: true,
  },
});

const FlashSales = mongoose.model("flashsale", flashSalesSchema);
module.exports = FlashSales;
