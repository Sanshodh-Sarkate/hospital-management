const { body } = require("express-validator");

module.exports.createDepartmentValidation = [
  body("departmentName")
    .trim()
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("floor")
    .notEmpty()
    .withMessage("Floor is required")
    .isInt({ min: 0 })
    .withMessage("Floor must be a positive integer"),

  body("defaultConsultationFee")
    .notEmpty()
    .withMessage("Default consultation fee is required")
    .isFloat({ min: 0 })
    .withMessage("Consultation fee must be greater than or equal to 0"),
];

module.exports.updateDepartmentValidation = [
  body("departmentName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("floor")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Floor must be a positive integer"),

  body("defaultConsultationFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Consultation fee must be greater than or equal to 0"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),
];