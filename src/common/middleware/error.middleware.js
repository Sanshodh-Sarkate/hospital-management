const { sendError } = require('../utils/response.util');

const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || err.stausCode || 500;
    const message = err.message || "Internal Server Error";

    return sendError(res, statusCode, message);
};

module.exports = errorMiddleware;