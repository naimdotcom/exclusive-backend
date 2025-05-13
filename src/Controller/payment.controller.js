const Cart = require("../Model/cart.model");
const Order = require("../Model/order.mode");
const apiError = require("../utils/ApiError");
const apiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");
exports.paymentSucess = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    order.paymentinfo.ispaid = true;
    await order.save();

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
