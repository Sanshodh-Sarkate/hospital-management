const asyncHandler = require("../../common/utils/async-handler");
const adminService = require("./admin.service");
const { sendSuccess } = require("../../common/utils/response.util");

module.exports.getAdminDashboardMetrics = asyncHandler(async (req, res, next) => {
  const stats = await adminService.getAdminDashboardStats();
  return sendSuccess(
    res,
    200,
    "Executive admin dashboard metrics retrieved successfully",
    { stats }
  );
});
