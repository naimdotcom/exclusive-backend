const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const {
  createCategory,
  getAllCategory,
} = require("../../Controller/category.controller");

// todo: create category
_.route("/")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createCategory)
  .get(getAllCategory);

module.exports = _;
