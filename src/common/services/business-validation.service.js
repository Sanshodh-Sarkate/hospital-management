const userRepository = require("../../modules/user/user.repository");
const AppError = require("../errors/app.error");

module.exports.checkUserUniqueness = async ({
  email,
  phoneNumber,
  excludeUserId = null,
}) => {

  if (email) {
    const existingEmail = await userRepository.findUserByEmail(email);

    if (existingEmail && existingEmail.id !== excludeUserId) {
      throw new AppError("Email is already registered", 409);
    }
  }

  if (phoneNumber) {
    const existingPhone =
      await userRepository.findUserByPhoneNumber(phoneNumber);

    if (existingPhone && existingPhone.id !== excludeUserId) {
      throw new AppError("Phone number is already registered", 409);
    }
  }
};