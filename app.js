const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const routes_v1 = require("./src/Routes/index");

app.use(express.json());
app.use(express.static("public/temp"));
app.use("/api/v1", routes_v1);

module.exports = { app };
