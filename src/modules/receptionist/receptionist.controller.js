const receptionistServices = require('./receptionist.services');
const asyncHandler = require('../../common/utils/async-handler');

module.exports.createReceptionist = asyncHandler(async (req, res, next) => {
  const result = await receptionistServices.CreateReceptionist(req.body, req.user.id);
  return res.status(201).json({
    success: true,
    message: "Receptionist created successfully",
    data: result,
  });
});

module.exports.getAllReceptionists = asyncHandler(async (req, res, next) => {
  const receptionists = await receptionistServices.getAllReceptionist();
  return res.status(200).json({
    success: true,
    message: "Receptionists fetched successfully",
    results: receptionists.length,
    data: receptionists,
  });
});

module.exports.getReceptionistById = asyncHandler(async (req, res, next) => {
  const receptionist = await receptionistServices.getReceptionistById(req.params.id);
  return res.status(200).json({
    success: true,
    message: "Receptionist fetched successfully",
    data: receptionist,
  });
});

module.exports.getReceptionistByEmployeeId = asyncHandler(async (req, res, next) => {
  const receptionist = await receptionistServices.getReceptionistByEmployeeId(req.params.employeeId);
  return res.status(200).json({
    success: true,
    message: "Receptionist fetched successfully",
    data: receptionist,
  });
});

module.exports.updateReceptionist = asyncHandler(async (req, res, next) => {
  const updatedReceptionist = await receptionistServices.updateReceptionist(
    req.params.id,
    req.body,
    req.user.id
  );
  return res.status(200).json({
    success: true,
    message: "Receptionist updated successfully",
    data: updatedReceptionist,
  });
});

module.exports.deleteReceptionist = asyncHandler(async (req, res, next) => {
  const deletedReceptionist = await receptionistServices.deleteReceptionist(
    req.params.id,
    req.user.id
  );
  return res.status(200).json({
    success: true,
    message: "Receptionist deleted successfully",
    data: deletedReceptionist,
  });
});
