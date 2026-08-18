const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response.util");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = {};

  errors.array().forEach((error) => {
    if (!formattedErrors[error.path]) {
      formattedErrors[error.path] = error.msg;
    }
  });

  return sendError(res, 400, "Validation failed", formattedErrors);
};

module.exports = validateRequest;