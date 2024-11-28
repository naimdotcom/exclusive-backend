const express = require("express");
const app = express();
const routes_v1 = require("./src/Routes/index");

app.use(express.json());
app.use("/api/v1", routes_v1);

module.exports = { app };
