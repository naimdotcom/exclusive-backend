const apiResponse = require("../../utils/ApiResponse");
const apiError = require("../../utils/ApiError");
const {
  validateEmail,
  validatePassword,
  validateBdPhoneNumber,
} = require("../../utils/validationRegex");
const { hashPassword } = require("../../Helpers/bcrypt");
const { SendMail } = require("../../Helpers/nodemailer");
const {
  OtpEmailTemplate,
  verifiedEmailTemplate,
} = require("../../Helpers/emailTemplates");
const userModel = require("../../Model/user.model");
const { generateOTP } = require("../../Helpers/otp");

exports.registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, address1, address2 } =
      req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json(new apiError(400, "bad request", null, null));
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid email", null, null));
    }
    if (!validatePassword(password) && process.env.NODE_ENV === "production") {
      return res
        .status(400)
        .json(new apiError(400, "invalid password", null, null));
    }
    if (!validateBdPhoneNumber(phone)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid phone number", null, null));
    }
    const user = await userModel.findOne({
      $or: [{ email: email }, { phoneNumber: phone }],
    });

    if (user) {
      return res
        .status(400)
        .json(new apiError(400, "user already exist. ", null, null));
    }

    /**
     * generate hash password
     * @Param {string} password
     */

    const hashedPassword = await hashPassword(password);
    const otp = await generateOTP();
    const expirationTime = new Date().getTime() + 3 * 60 * 1000;

    const info = await SendMail(
      OtpEmailTemplate(firstName, otp, expirationTime),
      email,
      "Verification Email  ✔"
    );

    if (!info) {
      // !if mail is not sent, it shouldn't create DB user
      return res
        .status(500)
        .json(new apiError(500, "server error in sending mail", null, null));
    }

    const newUser = await userModel.create({
      firstName,
      ...(lastName && { lastName }),
      email,
      phoneNumber: phone,
      otp: otp,
      password: hashedPassword,
      ...(address1 && { address1 }),
      ...(address2 && { address2 }),
      otpExpirationTime: expirationTime,
    });

    res.status(200).json(new apiResponse(200, "success", newUser, null));
  } catch (error) {
    console.log(`error from register admin: ${error}`);
    res.status(500).json(new apiError(500, "server error", null, null));
  }
};

exports.verifyAdminOTP = async (req, res) => {
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
      return res
        .status(400)
        .json({ ...new apiError(400, "bad request", null, null) });
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

    if (user.otp !== otpString) {
      return res.status(400).json(new apiError(400, "invalid otp", null, null));
    }

    if (new Date(user.otpExpirationTime).getTime() < new Date().getTime()) {
      return res
        .status(400)
        .json({ ...new apiError(400, "time expired"), redirectUrl: "" });
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
      .select(
        "-otp -otpExpirationTime -password -role -createdAt -updatedAt -__v -isVerified"
      );

    if (!updatedUser) {
      return res
        .status(400)
        .json(new apiError(400, "user not found or server error", null, null));
    }

    // todo: send email to user that he's verified

    const info = await SendMail(
      verifiedEmailTemplate(updatedUser.firstName),
      "Your email verified",
      updatedUser.email
    );

    res.status(200).json(new apiResponse(200, "success", updatedUser, null));
  } catch (error) {
    console.log("error from verifyTheOTP controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};
