const apiError = require("../utils/ApiError");

function resNotValid({
  data,
  statusCode = 404,
  msg = "invalid creadential",
  error = null,
  res,
}) {
  if (!data) {
    res.status(statusCode).json(new apiError(statusCode, msg, null, error));
  }
  return;
}

module.exports = {
  resNotValid,
};
