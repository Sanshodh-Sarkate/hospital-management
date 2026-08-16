// CHANGED
const asyncHandler = require("../../common/utils/async-handler");
const billingServices = require("./billing-services");
const { sendSuccess, sendPaginated } = require("../../common/utils/response.util");

// 1. Get Billing By ID
module.exports.getBillingById = asyncHandler(async (req, res, next) => {
  const billing = await billingServices.getBillingById(req.params.id, req.user);
  return sendSuccess(res, 200, "Invoice retrieved successfully", { billing });
});

// CHANGED: 2. Get All Billings (Supports APIFeatures query parameters)
module.exports.getAllBillings = asyncHandler(async (req, res, next) => {
  const bills = await billingServices.getAllBillings(req.query);
  return sendPaginated(res, 200, "Invoices retrieved successfully", bills);
});

// CHANGED: 3. Get My Billings (Patient Self-Service Supports APIFeatures query parameters)
module.exports.getMyBillings = asyncHandler(async (req, res, next) => {
  const paginatedData = await billingServices.getMyBillings(req.user, req.query);
  return sendPaginated(res, 200, "My invoices retrieved successfully", paginatedData);
});


// 4. Update / Finalize Bill (Admin / Receptionist)
module.exports.updateBilling = asyncHandler(async (req, res, next) => {
  const billing = await billingServices.updateBilling(
    req.params.id,
    req.body,
    req.user
  );
  return sendSuccess(res, 200, "Invoice updated successfully", { billing });
});

