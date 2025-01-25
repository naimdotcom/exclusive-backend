const express = require("express");
const {
  createFlashSales,
  getAllFlashSale,
} = require("../../Controller/flashSales.controller");
const _ = express.Router();

_.route("/").post(createFlashSales).get(getAllFlashSale);

module.exports = _;
