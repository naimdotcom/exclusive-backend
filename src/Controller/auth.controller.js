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

const DbSelect =
  "-password -__v -createdAt -updatedAt -otp -otpExpirationTime -role -isVerified";

const registration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      address1,
      address2,
    } = req.body;

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
    const expirationTime = new Date().getTime() + 10 * 60 * 1000;

    console.log(otp, expirationTime);

    /**
     * todo: send mail to user for OTP verification
     * @param {string} firstName
     * @param {string} Otp
     * @param {string} email
     * @param {Date} expirationTime
     */

    const info = await SendMail(firstName, otp, email, expirationTime);

    if (!info) {
      // !if mail is not sent, it shouldn't create DB user
      return res
        .status(500)
        .json(new apiError(500, "server error in sending mail", null, null));
    }

    // todo: create new user

    const newUser = await userModel.create({
      firstName,
      ...(lastName && { lastName }),
      email,
      phoneNumber,
      password: hashedPassword,
      ...(address1 && { address1 }),
      ...(address2 && { address2 }),
    });

    /**
     * todo: update the user db with otp and expiration time
     * @param {string} otp
     * @param {Date} expirationTime
     */

    const updatedUser = await userModel
      .findOneAndUpdate(
        {
          _id: newUser._id,
        },
        {
          otp: otp,
          otpExpirationTime: expirationTime,
        },
        {
          new: true,
        }
      )
      .select(
        "-password -__v -createdAt -updatedAt -otp -otpExpirationTime -role -isVerified"
      );

    res.status(200).json(new apiResponse(200, "success", updatedUser, null));
  } catch (error) {
    console.log("error from registration controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

// todo: user login

const login = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;

    // todo: validation of request
    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json(new apiError(400, "email or phoneNumber required", null, null));
    }
    if (!password) {
      return res
        .status(400)
        .json(new apiError(400, "password required", null, null));
    }

    // todo: check if user exist

    const user = await userModel.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (!user) {
      return res
        .status(404)
        .json(new apiError(404, "user not found", null, null));
    }

    // todo: check if password is correct
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json(new apiError(401, "invalid credentials", null, null));
    }

    // todo: generate token
    const payload = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    /**
     * todo: generate jwt token
     * @param {object} payload
     */
    const token = await generateJwtToken(payload);

    // todo: send response to user with token
    res
      .status(200)
      .json(new apiResponse(200, "success", { user, token }, null));
  } catch (error) {
    console.log("error from login controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

// todo: verify otp

const verifyTheOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // todo: validation of request

    if (
      !email ||
      !otp ||
      otp == "null" ||
      otp == "undefined" ||
      !email == "null" ||
      !email == "undefined"
    ) {
      return res.status(400).json(new apiError(400, "bad request", null, null));
    }

    // todo: check if user exist
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json(new apiError(400, "user not found", null, null));
    }

    // todo: check if otp is valid
    const otpString = Number(otp);

    /**
     * !database saving the date in YYYY:MM:DD HH:mm:ss format
     * ! but we are compare it in milliseconds
     * ! so we need to convert it to milliseconds the otp expiration time then compare it with current time
     */
    console.log(
      user.otpExpirationTime,
      new Date(user.otpExpirationTime).getTime(),
      new Date(user.otpExpirationTime).getTime() < new Date().getTime()
    );

    if (
      user.otp !== otpString ||
      new Date(user.otpExpirationTime).getTime() < new Date().getTime()
    ) {
      return res
        .status(400)
        .json(new apiError(400, "invalid otp or time expired", null, null));
    }

    // todo: update user

    const updatedUser = await userModel
      .findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          otp: null,
          otpExpirationTime: null,
          isVerified: true,
        },
        {
          new: true,
        }
      )
      .select(DbSelect);

    res.status(200).json(new apiResponse(200, "success", updatedUser, null));
  } catch (error) {
    console.log("error from verifyTheOTP controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

module.exports = { registration, verifyTheOTP };
