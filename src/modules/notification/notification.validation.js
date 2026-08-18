const { param } = require("express-validator");

module.exports.markAsReadValidation = [
  param("id")
    .isUUID()
    .withMessage("Invalid notification ID format"),
];
