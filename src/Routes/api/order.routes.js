const express = require("express");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/place-order").post(verifyAuth);

module.exports = _;
