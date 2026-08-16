const asyncHandler = require("../../common/utils/async-handler");
const billingServices = require("./billing-services");
const { sendSuccess } = require("../../common/utils/response.util");

// 1. Get Billing By ID
module.exports.getBillingById = asyncHandler(async (req, res, next) => {
  const billing = await billingServices.getBillingById(req.params.id, req.user);
  return sendSuccess(res, 200, "Invoice retrieved successfully", { billing });
});

// 2. Get All Billings (Admin / Receptionist)
module.exports.getAllBillings = asyncHandler(async (req, res, next) => {
  const billings = await billingServices.getAllBillings();
  return sendSuccess(res, 200, "Invoices retrieved successfully", {
    billings,
    results: billings.length,
  });
});

// 3. Get My Billings (Patient Self-Service)
module.exports.getMyBillings = asyncHandler(async (req, res, next) => {
  const billings = await billingServices.getMyBillings(req.user);
  return sendSuccess(res, 200, "My invoices retrieved successfully", {
    billings,
    results: billings.length,
  });
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

