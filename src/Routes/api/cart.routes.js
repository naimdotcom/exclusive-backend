const express = require("express");
const {
  createCart,
  getAllCartItemForUser,
  actionForCart,
  deleteUserCart,
} = require("../../Controller/cart.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/")
  .post(verifyAuth, createCart)
  .get(verifyAuth, getAllCartItemForUser);
_.route("/:id").delete(verifyAuth, deleteUserCart);
_.route("/action").post(verifyAuth, actionForCart);

module.exports = _;
