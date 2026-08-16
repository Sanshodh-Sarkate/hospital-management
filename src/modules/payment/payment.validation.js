const { body, param } = require("express-validator");
const PaymentMethod = require("../../common/enums/payment-method.enum");

module.exports.processPaymentValidation = [
  param("billingId")
    .isUUID()
    .withMessage("Invalid Invoice ID format"),

  body("amount")
    .notEmpty()
    .withMessage("Payment amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(Object.values(PaymentMethod))
    .withMessage(`Invalid payment method. Allowed: ${Object.values(PaymentMethod).join(", ")}`),

  body("transactionId")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  body("paymentDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid payment date format"),
];
