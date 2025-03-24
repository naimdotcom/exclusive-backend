const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const {
  placeOrder,
  getOrder,
  getOrderById,
} = require("../../Controller/order.controller");
const _ = express.Router();

_.route("/place-order").post(verifyAuth, placeOrder);

_.route("/").get(getOrder); // todo: add verify auth for admin

_.route("/:id").get(getOrderById); // todo: add verify auth for admin

module.exports = _;
