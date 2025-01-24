const express = require("express");
const _ = express.Router();
const {
  createSubCategory,
  getSubcategory,
} = require("../../Controller/subCategory.controller");

_.route("/").post(createSubCategory).get(getSubcategory);

_.route("/:id").get();
module.exports = _;
