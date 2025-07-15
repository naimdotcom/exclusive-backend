const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const routes_v1 = require("./src/Routes/index");
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: [
      "https://exclusive-taupe.vercel.app",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public/temp"));
app.use("/api/v1", routes_v1);

module.exports = { app };
