const { validationResult } = require("express-validator");

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

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: formattedErrors,
  });
};

module.exports = validateRequest;