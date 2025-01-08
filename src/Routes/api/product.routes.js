const express = require("express");
const { upload } = require("../../middleware/multer.middleware");
const _ = express.Router();

_.route("/product").post(upload.fields([{ name: "image", maxCount: 1 }]));

module.exports = _;
