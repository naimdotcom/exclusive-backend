const express = require("express");
const { upload } = require("../../middleware/multer.middleware");
const {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProductInformation,
  updateProductImages,
} = require("../../Controller/product.controller");
const _ = express.Router();

_.route("/")
  .post(upload.fields([{ name: "image", maxCount: 4 }]), createProduct)
  .get(getAllProduct);

_.route("/:id")
  .get(getSingleProduct)
  .put(updateProductInformation)
  .patch(upload.fields([{ name: "image", maxCount: 4 }]), updateProductImages);

module.exports = _;
