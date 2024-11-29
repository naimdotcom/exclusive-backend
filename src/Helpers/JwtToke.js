const jwt = require("jsonwebtoken");

const generateJwtToken = async (payload) => {
  try {
    return await jwt.sign(payload, process.env.TOKEN_SECRECT, {
      expiresIn: process.env.TOKEN_SECRECT_EXPIRY,
    });
  } catch (error) {
    console.log(`error from generating jwt token: ${error}`);
  }
};

module.exports = { generateJwtToken };
