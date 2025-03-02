const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");
const {
  validateEmail,
  validatePassword,
  validateBdPhoneNumber,
} = require("../utils/validationRegex");
const userModel = require("../Model/user.model");
const { hashPassword, comparePassword } = require("../Helpers/bcrypt");
const { generateOTP } = require("../Helpers/otp");
const { SendMail } = require("../Helpers/nodemailer");
const { generateJwtToken } = require("../Helpers/JwtToke");

const createCart = async (req, res) => {
  try {
    const {} = req.body;
  } catch (error) {
    console.log("error in create cart", error);
    res.status(500).json(new apiError(500, "server error in creating cart"));
  }
};

module.exports = {
  createCart,
};
