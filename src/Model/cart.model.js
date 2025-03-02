const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const cartSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "user",
    require: true,
  },
  product: {
    type: Types.ObjectId,
    ref: "product",
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
    default: 1,
  },
  totalPrice: {
    type: Number,
  },
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
