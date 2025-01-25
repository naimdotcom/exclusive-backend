const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const {
  createBanner,
  updateBanner,
  getBanner,
  deleteBanner,
} = require("../../Controller/banner.controller");

_.route("/")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createBanner)
  .get(getBanner);

_.route("/:id")
  .put(upload.fields([{ name: "image", maxCount: 1 }]), updateBanner)
  .delete(deleteBanner);

module.exports = _;
