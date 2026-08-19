const { sendError } = require("../utils/response.util");

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || err.stausCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // 1. Invalid UUID format in URL or query params (PostgreSQL Error Code 22P02)
  if (err.code === "22P02" || (err.message && err.message.includes("invalid input syntax for type uuid"))) {
    statusCode = 400;
    message = "Invalid ID format provided in URL. Please provide a valid UUID.";
    errors = null;
  }

  // 2. Duplicate record violation (PostgreSQL Unique Constraint Error Code 23505)
  else if (err.code === "23505") {
    statusCode = 409;
    message = "A resource with this information already exists.";
    errors = null;
  }

  // 3. Foreign key constraint violation (PostgreSQL Foreign Key Error Code 23503)
  else if (err.code === "23503") {
    statusCode = 400;
    message = "Referenced resource does not exist or cannot be linked.";
    errors = null;
  }

  // 4. Malformed JSON payload in request body
  else if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    statusCode = 400;
    message = "Invalid JSON payload provided in request body.";
    errors = null;
  }

  // 5. JWT Token Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please log in again.";
    errors = null;
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
    errors = null;
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = errorMiddleware;