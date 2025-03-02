const express = require("express");
const {
  createCart,
  getAllCartItemForUser,
  actionForCart,
} = require("../../Controller/cart.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/")
  .post(verifyAuth, createCart)
  .get(verifyAuth, getAllCartItemForUser);
_.route("/:id").get(verifyAuth);
_.route("/action").post(verifyAuth, actionForCart);

module.exports = _;
