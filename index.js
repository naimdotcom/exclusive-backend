const { app } = require("./app");
const dotenv = require("dotenv");
const { connectDB } = require("./src/DB/index");
const express = require("express");

dotenv.config();

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
