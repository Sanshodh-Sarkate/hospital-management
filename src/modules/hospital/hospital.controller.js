const hospitalService = require("./hospital.service");
const asyncHandler = require("../../common/utils/async-handler");
const { sendSuccess } = require("../../common/utils/response.util");

// 1. Get Hospital Details
module.exports.getHospitalDetails = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.getHospital();
  return sendSuccess(res, 200, "Hospital details fetched successfully", { hospital });
});

// 2. Update Hospital Details (ADMIN Only)
module.exports.updateHospitalDetails = asyncHandler(async (req, res) => {
  const updatedHospital = await hospitalService.updateHospital(req.body);
  return sendSuccess(res, 200, "Hospital details updated successfully", { hospital: updatedHospital });
});

