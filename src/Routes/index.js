const express = require("express");
const _ = express.Router();
const authRoutes = require("./api/auth.routes.js");

_.use("/auth", authRoutes);
_.get("/health", (req, res) => {
  res.status(200).json({
    data: "health api",
  });
});

module.exports = _;
