const jwt = require("jsonwebtoken");
const userRepository = require('../user/user.repository');
const AppError = require('../../common/errors/app.error');
const asyncHandler = require('../../common/utils/async-handler')
const { promisify } = require('util')

// CHANGED
const { verifyAccessToken } = require('../../common/utils/jwt.util');

module.exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token || token === 'loggedout') {
    return next(new AppError('You are not logged in! Please log in to get access', 401));
  }

  // Verification of the Access Token
  let decode;
  try {
    decode = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired', 401));
    }
    return next(new AppError('Invalid access token', 401));
  }

  // Ensure Refresh Token is never accepted as an Access Token
  if (decode.tokenType === 'refresh') {
    return next(new AppError('Refresh token cannot be used for API access', 401));
  }

  const currentUser = await userRepository.findUserById(decode.id);
  if (!currentUser) {
    return next(new AppError("User no longer exists", 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError("User account is deactivated", 401));
  }

  // Check if password changed after token was issued
  if (currentUser.passwordChangedAt) {
    const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    if (decode.iat < changedTimestamp) {
      return next(new AppError("User recently changed password! Please log in again.", 401));
    }
  }

  req.user = currentUser;
  next();
});


module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }

    next();
  };
};