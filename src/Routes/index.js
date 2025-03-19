const express = require("express");
const _ = express.Router();
const authRoutes = require("./api/auth.routes.js");
const categoryRoutes = require("./api/category.routes.js");
const productRoutes = require("./api/product.routes.js");
const subCategoryRoutes = require("./api/subCategory.routes.js");
const bannerRoutes = require("./api/banner.routes.js");
const flashSalesRoutes = require("./api/flashSales.routes.js");
const cartRoutes = require("./api/cart.routes.js");
const orderRoutes = require("./api/order.routes.js");
const paymentRoutes = require("./api/payment.routes.js");

_.use("/auth", authRoutes);
_.use("/category", categoryRoutes);
_.use("/product", productRoutes);
_.use("/subcategory", subCategoryRoutes);
_.use("/banner", bannerRoutes);
_.use("/flashsales", flashSalesRoutes);
_.use("/cart", cartRoutes);
_.use("/order", orderRoutes);
_.use("/payment", paymentRoutes);
_.get("/health", (req, res) => {
  res.status(200).json({
    data: "health api",
  });
});

module.exports = _;
