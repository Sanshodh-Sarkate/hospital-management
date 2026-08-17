const adminRepository = require("./admin.repository");

module.exports.getAdminDashboardStats = async () => {
  return await adminRepository.getAdminDashboardMetrics();
};
