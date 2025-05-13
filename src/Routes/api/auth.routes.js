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
const {
  registerAdmin,
  verifyAdminOTP,
} = require("../../Controller/admin/auth.controller.js");

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

// admin routes

_.route("/admin-registration").post(registerAdmin);

_.route("/admin-verify-otp").post(verifyAdminOTP);

module.exports = _;
