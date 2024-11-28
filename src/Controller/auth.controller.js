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

const registration = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // todo: validation of request

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json(new apiError(400, "bad request", null, null));
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid email", null, null));
    }
    // if (!validatePassword(password)) {
    //   return res
    //     .status(400)
    //     .json(new apiError(400, "invalid password", null, null));
    // }
    if (!validateBdPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid phone number", null, null));
    }

    // todo: check if user already exist

    const user = await userModel.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (user) {
      return res
        .status(400)
        .json(new apiError(400, "user already exist. ", null, null));
    }

    /**
     * todo: generate hash password
     * @Param {string} password
     */

    const hashedPassword = await hashPassword(password);

    // todo: generate otp

    const otp = await generateOTP();

    /**
     * todo: send mail to user for OTP verification
     * @param {string} firstName
     * @param {string} Otp
     * @param {string} email
     */

    const info = await SendMail(firstName, otp, email);

    if (!info) {
      // !if mail is not sent, it shouldn't create DB user
      return res
        .status(500)
        .json(new apiError(500, "server error in sending mail", null, null));
    }

    // todo: create new user

    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(200).json(new apiResponse(200, "success", req.body, null));
  } catch (error) {
    console.log("error from registration controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

module.exports = { registration };
