const options = {
  httpOnly: true,
  secure: true, // Required in production (HTTPS)
  sameSite: "None", // Allow cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = options;
