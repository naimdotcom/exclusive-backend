const Cart = require("../Model/cart.model");
const Order = require("../Model/order.mode");
const apiError = require("../utils/ApiError");
const apiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");
exports.paymentSucess = async (req, res) => {
  try {
    const { id } = req.body;

    const ordersWithTranId = await Order.aggregate([
      // Stage 1: Find documents where isPaid is false or doesn't exist
      {
        $match: {
          $or: [{ isPaid: false }, { isPaid: { $exists: false } }],
        },
      },

      // Stage 2: Get the _id of each document
      {
        $project: {
          _id: 1,
          // Include other fields you want to see in the results
          paymentAmount: 1,
          paymentDate: 1,
          customerId: 1,
        },
      },

      // Stage 3: Update each document
      {
        $merge: {
          into: "payments",
          on: "_id",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ]);

    console.log(ordersWithTranId);
    return;
    const orderId = ordersWithTranId[0]._id;
    console.log(orderId);
    const updatedOrder = await Order.findById(orderId);
    updatedOrder.paymentinfo.ispaid = true;
    await updatedOrder.save();
    res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
  } catch (error) {
    console.log("error from payment sucess", error);
    res.status(500).json(new apiError(500, "something went wrong"));
  }
};

exports.paymentCancel = async (req, res) => {
  try {
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
  } catch (error) {
    console.log("error from payment cancel", error);
    res.status(500).json(new apiError(500, "something went wrong"));
  }
};

exports.paymentFailed = async (req, res) => {
  try {
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  } catch (error) {
    console.log("error from payment failed", error);
    res.status(500).json(new apiError(500, "something went wrong"));
  }
};

exports.paymentIpn = async (req, res) => {
  try {
    res.redirect(`${process.env.FRONTEND_URL}/payment/ipn`);
  } catch (error) {
    console.log("error from payment ipn", error);
    res.status(500).json(new apiError(500, "something went wrong"));
  }
};
