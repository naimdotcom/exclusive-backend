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
const {
  OtpEmailTemplate,
  logedInEmailTemplate,
  verifiedEmailTemplate,
  updateEmailTemplate,
} = require("../Helpers/emailTemplates");

const DbSelect =
  "-password -__v -createdAt -updatedAt -otp -otpExpirationTime -role -isVerified";

const registration = async (req, res) => {
  console.log(req.body);
  try {
    const { firstName, lastName, email, phone, password, address1, address2 } =
      req.body;

    // todo: validation of request

    if (!firstName || !lastName || !email || !phone || !password) {
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
    if (!validateBdPhoneNumber(phone)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid phone number", null, null));
    }

    // todo: check if user already exist

    const user = await userModel.findOne({
      $or: [{ email: email }, { phoneNumber: phone }],
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
     * @param {Date} expirationTime
     */

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

    // todo: create new user

    const newUser = await userModel.create({
      firstName,
      ...(lastName && { lastName }),
      email,
      phoneNumber: phone,
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
  console.log(req.body);
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

    // todo: check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        ...new apiError(401, `user is not verified`),
        redirectUrl: `http://localhost:5173/otp/${user.email}`,
      });
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
      isVerified: user.isVerified,
    };
    /**
     * todo: generate jwt token
     * @param {object} payload
     */
    const token = await generateJwtToken(payload);

    // todo: send response to user with token
    res
      .status(200)
      .cookie("token", token)
      .json(new apiResponse(200, "success", { user, token }, null));

    setImmediate(async () => {
      try {
        // todo: send email to user that he's logged in

        const info = await SendMail(
          logedInEmailTemplate(user.firstName, user.email),
          user.email,
          "logged in exlusive 🫶"
        );
      } catch (error) {
        console.error("Failed to send login email:", error);
      }
    });
  } catch (error) {
    console.log("error from login controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

const userAuth = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(new apiResponse(200, "success", user));
  } catch (error) {}
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json(new apiResponse(200, "Logout successful", null, null));
  } catch (error) {
    res.status(500).json(new apiError(500, "Server error", null, error));
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
      .select(DbSelect);

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

// todo: resend otp
const resendTheOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // todo: validation of request

    if (!email) {
      return res
        .status(400)
        .json(new apiError(400, "email is required", null, null));
    }

    // todo: check if user exist
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json(new apiError(400, "user not found", null, null));
    }

    // todo: check if user is time is expired or not

    if (
      user.otpExpirationTime &&
      new Date(user.otpExpirationTime).getTime() > new Date().getTime()
    ) {
      return res
        .status(400)
        .json(new apiError(400, "time not expired", null, null));
    }

    // todo: generate otp
    const otp = await generateOTP();
    const expireTime = new Date(Date.now() + 5 * 60 * 1000);

    // todo: update user
    const updatedUser = await userModel
      .findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          otp: otp,
          otpExpirationTime: expireTime,
        },
        {
          new: true,
        }
      )
      .select(DbSelect);

    if (!updatedUser) {
      return res
        .status(400)
        .json(new apiError(400, "user not found or server error", null, null));
    }

    // todo: send email to user

    const info = await SendMail(
      OtpEmailTemplate(user.firstName, otp, expireTime),
      user.email,
      "OTP Verification"
    );

    res
      .status(200)
      .json(new apiResponse(200, "success and otp sent", null, null));
  } catch (error) {
    console.log("error from resendTheOTP controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

// todo: homework: update the email. via verification...

const updateEmail = async (req, res) => {
  try {
    const { email, updatedEmail, password } = req.body;

    // todo: validation of request

    if (!email || !updatedEmail || !password) {
      return res.status(400).json(new apiError(400, "bad request", null, null));
    }

    // todo: check if user exist
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json(new apiError(400, "user not found", null, null));
    }

    // todo: check if password is correct
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json(new apiError(401, "invalid credentials", null, null));
    }

    // todo: update email
    const updatedUser = await userModel
      .findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          email: updatedEmail,
        },
        {
          new: true,
        }
      )
      .select(DbSelect);

    // todo: send email to user that he's verified

    await SendMail(
      updateEmailTemplate(user.firstName, updatedEmail),
      user.email,
      "updated email"
    );

    await SendMail(
      updateEmailTemplate(user.firstName, updatedEmail),
      updatedEmail,
      "updated email"
    );

    res.status(200).json(new apiResponse(200, "success", updatedUser, null));
  } catch (error) {
    console.log("error from updateEmail controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

// todo: reset password

module.exports = {
  registration,
  verifyTheOTP,
  login,
  updateEmail,
  resendTheOTP,
  userAuth,
  logout,
};
