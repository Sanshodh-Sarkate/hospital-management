//
const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const paymentValidation = require("./payment.validation");
const authMiddleware = require("../auth/auth.middleware");
const validateRequest = require("../../common/middleware/validation.middleware");
const { validateQueryFeatures } = require("../../common/middleware/query-validation.middleware");
const Roles = require("../../common/enums/role.enum");

router.use(authMiddleware.protect);

// 1. Process Payment against an Invoice (Admin, Receptionist, Patient)
router.post(
  "/billings/:billingId",
  authMiddleware.restrictTo(Roles.ADMIN, Roles.RECEPTIONIST, Roles.PATIENT),
  paymentValidation.processPaymentValidation,
  validateRequest,
  paymentController.processPayment
);

//: 2. Get Payments by Billing ID (Admin, Receptionist, Patient Supports APIFeatures)
router.get(
  "/billings/:billingId",
  authMiddleware.restrictTo(Roles.ADMIN, Roles.RECEPTIONIST, Roles.PATIENT),
  validateQueryFeatures,
  validateRequest,
  paymentController.getPaymentsByBillingId
);


// 3. Get Payment Stats Summary (Admin & Receptionist - MUST come before /:id)
router.get(
  "/stats/summary",
  authMiddleware.restrictTo(Roles.ADMIN, Roles.RECEPTIONIST),
  paymentController.getPaymentStatsSummary
);

// 4. Get Payment Receipt by ID (Admin, Receptionist, Patient)
router.get(
  "/:id",
  authMiddleware.restrictTo(Roles.ADMIN, Roles.RECEPTIONIST, Roles.PATIENT),
  paymentController.getPaymentById
);

module.exports = router;

