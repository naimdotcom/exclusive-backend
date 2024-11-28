const dotenv = require("dotenv");
dotenv.config();
const { app } = require("./app");
const { connectDB } = require("./src/DB/index");
const express = require("express");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `exclusive app listening on port: ${process.env.PORT || 3000}`
      );
    });
    console.log("Connected to DB");
  })
  .catch((err) => console.log(`error from mongoDB connection: ${err}`));
