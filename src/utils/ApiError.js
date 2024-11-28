class apiError {
  /**
   * Constructs an instance of the apiError class.
   * @param {number} statusCode - The HTTP status code of the error.
   * @param {string} message - A descriptive message of the error.
   */
  constructor(statusCode, message, data, error) {
    // Assign the status code to the instance
    this.statusCode = statusCode;
    // Assign the error message to the instance
    this.message = message;
    // Assign the data to the instance
    this.data = data;
    // Assign the error object to the instance
    this.error = error ? error : null;
  }
}

module.exports = apiError;
