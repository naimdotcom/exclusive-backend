const apiResponse = require("../utils/ApiResponse");
const apiError = require("../utils/ApiError");
const {
  validateEmail,
  validatePassword,
  validateBdPhoneNumber,
} = require("../utils/validationRegex");
const userModel = require("../Model/user.model");

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
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid password", null, null));
    }
    if (!validateBdPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json(new apiError(400, "invalid phone number", null, null));
    }

    // todo: check if user already exist

    const user = await userModel.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (user.length > 0) {
      return res
        .status(400)
        .json(new apiError(400, "user already exist. ", null, null));
    }

    // todo: create new user

    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });

    console.log(req.body);
    res.status(200).json(new apiResponse(200, "success", req.body, null));
  } catch (error) {
    console.log("error from registration controller", error);
    res.status(500).json(new apiError(500, "server error", null, error));
  }
};

module.exports = { registration };
