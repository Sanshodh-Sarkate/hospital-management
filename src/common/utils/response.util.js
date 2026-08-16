// CHANGED
// Send Success Response
const sendSuccess = (res, statusCode = 200, message = "Success", data = null, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

// Send Paginated Collection Response
const sendPaginated = (res, statusCode = 200, message = "Success", paginatedData = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: paginatedData.items || [],
    pagination: paginatedData.pagination || null,
  });
};

// Send Error Response
const sendError = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
};
