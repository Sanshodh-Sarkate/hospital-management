// CHANGED
const authService = require('./auth.service');
const asyncHandler = require('../../common/utils/async-handler');
const { sendSuccess } = require('../../common/utils/response.util');
const AppError = require('../../common/errors/app.error');

// Helper to set HTTP-Only Refresh Token Cookie
const sendRefreshTokenCookie = (res, refreshToken) => {
  const cookieExpiresInDays = parseFloat(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  const cookieOptions = {
    expires: new Date(
      Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

// Helper to clear Refresh Token Cookie
const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.cookie('jwt', 'loggedout', {
    expires: new Date(0),
    httpOnly: true,
  });
};

module.exports.userRegister = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const result = await authService.registerUser(req.body);

  sendRefreshTokenCookie(res, result.refreshToken);

  const responseData = {
    user: result.registerNewUser,
    accessToken: result.accessToken,
  };

  return sendSuccess(res, 201, "User registered successfully", responseData);
});

module.exports.loginUser = asyncHandler(async (req, res, next) => {
  console.log(req.body);

  const loginUser = await authService.loginUser(req.body);
  console.log("loginUser", loginUser);

  sendRefreshTokenCookie(res, loginUser.refreshToken);

  const responseData = {
    user: loginUser.user,
    accessToken: loginUser.accessToken,
  };

  return sendSuccess(res, 200, "User logged in successfully", responseData);
});

// CHANGED: Refresh Token Controller
module.exports.refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const result = await authService.refreshAccessToken(refreshToken);

  // Send rotated new Refresh Token in HTTP-only cookie
  sendRefreshTokenCookie(res, result.refreshToken);

  const responseData = {
    accessToken: result.accessToken,
  };


  return sendSuccess(res, 200, "Access token refreshed successfully", responseData);
});

// CHANGED: Logout Controller
module.exports.logoutUser = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  await authService.logoutUser(userId);

  clearRefreshTokenCookie(res);

  return sendSuccess(res, 200, "User logged out successfully");
});

module.exports.profile = asyncHandler(async (req, res, next) => {
  const currentUser = await authService.getProfile(req.user);
  return sendSuccess(res, 200, "User Profile", currentUser);
});

module.exports.changePassword = asyncHandler(async (req, res, next) => {
  console.log(req.user.id);
  const data = await authService.changePassword(req.user, req.body);
  
  clearRefreshTokenCookie(res);

  return sendSuccess(res, 200, "Password changed successfully", data);
});

module.exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const data = await authService.forgatePassword(email);

  return sendSuccess(res, 200, "ResetToken send on your registered email");
});

module.exports.resetPassword = asyncHandler(async (req, res, next) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body
  );

  clearRefreshTokenCookie(res);

  return sendSuccess(res, 200, result.message);
});

module.exports.updateProfile = asyncHandler(async (req, res, next) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, 200, "user data update successFully", data);
});



 