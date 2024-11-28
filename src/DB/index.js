const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`DB connected to port: ${process.env.PORT}`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { connectDB };
