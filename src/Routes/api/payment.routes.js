const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const payment = require("../../Controller/payment.controller");
const _ = express.Router();

_.route("/success").post(payment.paymentSucess);
_.route("/fail").post(payment.paymentFailed);
_.route("/ipn").post(payment.paymentIpn);
_.route("/cancel").post(payment.paymentCancel);

module.exports = _;
