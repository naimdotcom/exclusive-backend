class apiResponse {
  constructor(statusCode, message, data, error) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = error ? error : null;
  }
}

module.exports = apiResponse;
