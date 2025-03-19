const express = require("express");
const {
  createCart,
  getAllCartItemForUser,
  actionForCart,
  deleteUserCart,
  deleteAllUserCart,
} = require("../../Controller/cart.controller");
const { verifyAuth } = require("../../middleware/auth.middleware");
const _ = express.Router();

_.route("/")
  .post(verifyAuth, createCart)
  .get(verifyAuth, getAllCartItemForUser)
  .delete(verifyAuth, deleteAllUserCart);
_.route("/:id").delete(verifyAuth, deleteUserCart);
_.route("/action").post(verifyAuth, actionForCart);

module.exports = _;
