 const authService =  require('./auth.service');
 const asyncHandler =  require('../../common/utils/async-handler')

// Helper to set JWT cookie
const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('jwt', token, cookieOptions);
};

module.exports.userRegister = asyncHandler(async(req , res , next) => {
    console.log(req.body)
   const result =  await authService.registerUser(req.body);

   sendTokenCookie(res, result.token);

   return  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
   })
 })

 module.exports.loginUser = asyncHandler(async(req  , res , next) => {
    console.log(req.body);
    
    const  loginUser  = await authService.loginUser(req.body);
    console.log("loginUser" , loginUser)

    sendTokenCookie(res, loginUser.token);
    
    return  res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: loginUser,
    })
 })

 module.exports.logoutUser = asyncHandler(async(req, res, next) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
 })

 module.exports.profile =  asyncHandler(async(req , res  , next) => {
    const currentUser  = await authService.getProfile(req.user);
    return  res.status(200).json({
      success: true,
      message: "User Profile" ,
      data: currentUser
    })
 })

 module.exports.changePassword = asyncHandler(async(req, res , next) => {
    console.log(req.user.id);
   const data  =  await authService.changePassword(req.user ,  req.body);

   return res.status(200).json({
    success: true,
    data: data
   })
 })

 module.exports.forgotPassword =asyncHandler(async  (req , res  , next) => {
    const {email} =  req.body;

    const data =   await authService.forgatePassword(email);

    return res.status(200).json({
        success:  true ,
        message: "ResetToken send on your registered email"
    });
 })

 module.exports.resetPassword = asyncHandler(async (req, res ,  next) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body
  );

   return res.status(200).json({
    success: true,
    message: result.message,
  });

});


  module.exports.updateProfile = asyncHandler(async(req , res , next) => {
    const data = await authService.updateProfile(req.user.id ,  req.body);
    return res.status(200).json({
      success: true ,
      message: "user data update successFully",
      data
    })
  })

 