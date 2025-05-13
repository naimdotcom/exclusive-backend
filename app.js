const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const routes_v1 = require("./src/Routes/index");
const cors = require("cors");

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5173/login",
      "http://localhost:3001",
      "https://exclusive-taupe.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.static("public/temp"));
app.use("/api/v1", routes_v1);

module.exports = { app };
