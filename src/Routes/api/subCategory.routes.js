const express = require("express");
const _ = express.Router();
const {
  createSubCategory,
  getSubcategory,
  getSubcategoryById,
  subcategoryUpdate,
  subcategoryDelete,
} = require("../../Controller/subCategory.controller");

_.route("/").post(createSubCategory).get(getSubcategory);

_.route("/:id")
  .get(getSubcategoryById)
  .put(subcategoryUpdate)
  .delete(subcategoryDelete);
module.exports = _;
