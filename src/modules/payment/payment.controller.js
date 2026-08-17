//
const asyncHandler = require("../../common/utils/async-handler");
const paymentServices = require("./payment.services");
const { sendSuccess, sendPaginated } = require("../../common/utils/response.util");

// 1. Process Payment (Admin, Receptionist, Patient)
module.exports.processPayment = asyncHandler(async (req, res, next) => {
  const result = await paymentServices.processPayment(
    req.params.billingId,
    req.body,
    req.user
  );
  return sendSuccess(res, 201, "Payment processed successfully", result);
});

//: 2. Get Payments by Billing ID (Admin, Receptionist, Patient Supports APIFeatures)
module.exports.getPaymentsByBillingId = asyncHandler(async (req, res, next) => {
  const paginatedData = await paymentServices.getPaymentsByBillingId(
    req.params.billingId,
    req.user,
    req.query
  );
  return sendPaginated(res, 200, "Payment history retrieved successfully", paginatedData);
});


// 3. Get Payment by ID (Admin, Receptionist, Patient)
module.exports.getPaymentById = asyncHandler(async (req, res, next) => {
  const payment = await paymentServices.getPaymentById(
    req.params.id,
    req.user
  );
  return sendSuccess(res, 200, "Payment receipt retrieved successfully", {
    payment,
  });
});

// 4. Get Payment Stats & Summary (Admin & Receptionist)
module.exports.getPaymentStatsSummary = asyncHandler(async (req, res, next) => {
  const summary = await paymentServices.getPaymentStatsSummary(req.query);
  return sendSuccess(res, 200, "Payment statistics summary retrieved successfully", {
    summary,
  });
});

