const mongoose = require("mongoose");

const { Types } = mongoose;

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    cartItem: [
      {
        type: Types.ObjectId,
        ref: "cart",
      },
    ],
    customerinfo: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      address1: {
        type: String,
        trim: true,
        required: true,
      },
      address2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
        required: true,
      },
      district: {
        type: String,
        trim: true,
        required: true,
        default: "Dhaka",
      },
      postcode: {
        type: Number,
      },
    },
    paymentinfo: {
      paymentmethod: {
        type: String,
        required: true,
      },
      ispaid: {
        type: Boolean,
        default: false,
      },
      val_id: {
        type: String,
        trim: true,
      },
      tran_id: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "deliverd", "cancel"],
      default: "pending",
      required: true,
      trim: true,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    totalQuantity: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;
