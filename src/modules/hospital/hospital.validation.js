const { body } = require("express-validator");

module.exports.updateHospitalValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Hospital name cannot be empty"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid hospital email address"),

  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Hospital contact phone cannot be empty"),

  body("emergencyPhone")
    .optional()
    .trim(),

  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Hospital address cannot be empty"),

  body("city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),

  body("state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State cannot be empty"),

  body("postalCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Postal code cannot be empty"),

  body("totalBeds")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total beds must be a positive integer"),
];
