const express  = require('express');
const authController  =  require('./auth.controller');
const validationRequest = require('../../common/middleware/validation.middleware');
const  {registerValidation , loginValidation , forgotPasswordValidation , resetPasswordValidation, updateProfileValidation} =  require('./auth.validation')
const authMiddleware =  require('./auth.middleware')


// CHANGED
const router = express.Router();

router.post('/register', registerValidation, validationRequest, authController.userRegister);
router.post('/login', loginValidation, validationRequest, authController.loginUser);
router.post('/refresh-token', authController.refreshToken);
router.get('/logout', authController.logoutUser);
router.post('/logout', authController.logoutUser);
router.get('/me', authMiddleware.protect, authController.profile);
router.patch('/change-password', authMiddleware.protect, authController.changePassword);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.patch(
  "/reset-password/:token",
  resetPasswordValidation,
  validationRequest,
  authController.resetPassword
);
router.patch('/update-profile', authMiddleware.protect, updateProfileValidation, authController.updateProfile);

module.exports = router;