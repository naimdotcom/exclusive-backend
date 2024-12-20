const express = require("express");
const _ = express.Router();
const authRoutes = require("./api/auth.routes.js");
const categoryRoutes = require("./api/category.routes.js");

_.use("/auth", authRoutes);
_.use("/category", categoryRoutes);
_.get("/health", (req, res) => {
  res.status(200).json({
    data: "health api",
  });
});

module.exports = _;
