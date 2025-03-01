const express = require("express");
const _ = express.Router();
const {
  registration,
  verifyTheOTP,
  login,
  resendTheOTP,
  userAuth,
  logout,
} = require("../../Controller/auth.controller.js");
const { verifyAuth } = require("../../middleware/auth.middleware.js");

// todo:  health cheacker route

_.route("/health-auth").get((req, res) => {
  res.status(200).json({
    data: "health auth api",
  });
});

// todo:  signup or registration route

_.route("/signup").post(registration);

// todo: verify otp

_.route("/verify-otp").post(verifyTheOTP);

// todo: user login

_.route("/login").post(login);

// logout
_.route("/logout").get(logout);

// user auth
_.route("/verify").get(verifyAuth, userAuth);

// todo: resend the otp

_.route("/resend-otp").post(resendTheOTP);

module.exports = _;
