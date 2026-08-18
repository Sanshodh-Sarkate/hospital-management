const { body, param } = require("express-validator");

module.exports.updateBillingValidation = [
  param("id")
    .isUUID()
    .withMessage("Invalid Invoice ID format"),

  body("discountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount amount must be a positive number"),

  body("insuranceCoverageAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Insurance coverage amount must be a positive number"),

  body("insuranceProvider")
    .optional()
    .trim(),

  body("insurancePolicyNumber")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  body("additionalItems")
    .optional()
    .isArray()
    .withMessage("Additional items must be an array"),

  body("additionalItems.*.itemName")
    .optional()
    .notEmpty()
    .withMessage("Item name is required"),

  body("additionalItems.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("additionalItems.*.unitPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a positive number"),
];

