const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const {
  createCategory,
  getAllCategory,
  getCategoryByIdOrName,
  updateCategory,
} = require("../../Controller/category.controller");

// todo: create category and get all category
_.route("/")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createCategory)
  .get(getAllCategory);

// todo: update category and get single category
_.route("/:id")
  .put(upload.fields([{ name: "image", maxCount: 1 }]), updateCategory)
  .get(getCategoryByIdOrName);

module.exports = _;
