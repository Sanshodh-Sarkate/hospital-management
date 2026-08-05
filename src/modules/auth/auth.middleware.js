const jwt  = require("jsonwebtoken");
const userRepository =  require('../user/user.repository');
const AppError =  require('../../common/errors/app.error');
const asyncHandler =  require('../../common/utils/async-handler')
const {promisify}  = require('util')

module.exports.protect = asyncHandler(async(req , res  , next) => {
   let token  ; 

    if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token  = req.cookies.jwt
  }

  if (!token || token === 'loggedout') return next(new AppError('You are not logged in! Please log in to get access', 401));

  // verification of the token 
  const decode   = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  const currentUser  = await userRepository.findUserById(decode.id);
 if (!currentUser) {
      return next(
        new AppError("User no longer exists", 401)
      );
    }
console.log("LoginUser: " , currentUser)
  req.user  =  currentUser 
  console.log(req.user)
   next(); 
}) 

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