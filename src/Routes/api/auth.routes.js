const express = require("express");
const _ = express.Router();
const { registration } = require("../../Controller/auth.controller.js");

// todo:  health cheacker route

_.route("/health-auth").get((req, res) => {
  res.status(200).json({
    data: "health auth api",
  });
});

// todo:  signup or registration route

_.route("/signup").post(registration);

module.exports = _;
