const receptionistServices = require('./receptionist.services');
const asyncHandler = require('../../common/utils/async-handler');
const { sendSuccess, sendPaginated } = require('../../common/utils/response.util');

// Get Receptionist Dashboard Metrics
module.exports.getReceptionistDashboard = asyncHandler(async (req, res, next) => {
  const stats = await receptionistServices.getReceptionistDashboardStats();
  return sendSuccess(
    res,
    200,
    "Receptionist dashboard metrics retrieved successfully",
    { stats }
  );
});


module.exports.createReceptionist = asyncHandler(async (req, res, next) => {
  const result = await receptionistServices.CreateReceptionist(req.body, req.user.id);
  return sendSuccess(res, 201, "Receptionist created successfully", result);
});

// Get All Receptionists (Supports APIFeatures query parameters)
module.exports.getAllReceptionists = asyncHandler(async (req, res, next) => {
  const receptionists = await receptionistServices.getAllReceptionist(req.query);
  return sendPaginated(res, 200, "Receptionists fetched successfully", receptionists);
});


module.exports.getReceptionistById = asyncHandler(async (req, res, next) => {
  const receptionist = await receptionistServices.getReceptionistById(req.params.id);
  return sendSuccess(res, 200, "Receptionist fetched successfully", receptionist);
});

module.exports.getReceptionistByEmployeeId = asyncHandler(async (req, res, next) => {
  const receptionist = await receptionistServices.getReceptionistByEmployeeId(req.params.employeeId);
  return sendSuccess(res, 200, "Receptionist fetched successfully", receptionist);
});

module.exports.updateReceptionist = asyncHandler(async (req, res, next) => {
  const updatedReceptionist = await receptionistServices.updateReceptionist(
    req.params.id,
    req.body,
    req.user.id
  );
  return sendSuccess(res, 200, "Receptionist updated successfully", updatedReceptionist);
});

module.exports.deleteReceptionist = asyncHandler(async (req, res, next) => {
  const deletedReceptionist = await receptionistServices.deleteReceptionist(
    req.params.id,
    req.user.id
  );
  return sendSuccess(res, 200, "Receptionist deleted successfully", deletedReceptionist);
});

