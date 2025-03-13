const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const { placeOrder } = require("../../Controller/order.controller");
const _ = express.Router();

_.route("/place-order").post(verifyAuth, placeOrder);

module.exports = _;
