const crypto = require("crypto");

const generateOTP = async () => {
  return await crypto.randomInt(100000, 999999);
};

module.exports = { generateOTP };
