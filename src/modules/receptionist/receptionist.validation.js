const { body } = require("express-validator");

const DB = require("../../common/constants/database.constants");
const Gender = require("../../common/enums/gender.enum");
const Shift = require("../../common/enums/shift.enum");

module.exports.createReceptionistValidation = [
  // User Fields
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: DB.NAME_MAX_LENGTH })
    .withMessage(`First name cannot exceed ${DB.NAME_MAX_LENGTH} characters`),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: DB.NAME_MAX_LENGTH })
    .withMessage(`Last name cannot exceed ${DB.NAME_MAX_LENGTH} characters`),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .isLength({ max: DB.EMAIL_MAX_LENGTH })
    .withMessage(`Email cannot exceed ${DB.EMAIL_MAX_LENGTH} characters`),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: DB.PASSWORD_MAX_LENGTH })
    .withMessage(
      `Password must be between 8 and ${DB.PASSWORD_MAX_LENGTH} characters`
    ),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: DB.PHONE_MAX_LENGTH })
    .withMessage("Invalid phone number"),

  // Receptionist Fields
  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format for date of birth"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(Object.values(Gender))
    .withMessage("Invalid gender"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),

  body("postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required"),

  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid date format for joining date"),

  body("shift")
    .notEmpty()
    .withMessage("Shift is required")
    .isIn(Object.values(Shift))
    .withMessage("Invalid shift"),

  body("profileImage")
    .optional()
    .trim()
    .isLength({ max: DB.PROFILE_IMAGE_MAX_LENGTH })
    .withMessage(`Profile image URL cannot exceed ${DB.PROFILE_IMAGE_MAX_LENGTH} characters`),
];

module.exports.updateReceptionistValidation = [
  // User Fields
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: DB.NAME_MAX_LENGTH })
    .withMessage(`First name cannot exceed ${DB.NAME_MAX_LENGTH} characters`),

  body("lastName")
    .optional()
    .trim()
    .isLength({ max: DB.NAME_MAX_LENGTH })
    .withMessage(`Last name cannot exceed ${DB.NAME_MAX_LENGTH} characters`),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .isLength({ max: DB.EMAIL_MAX_LENGTH })
    .withMessage(`Email cannot exceed ${DB.EMAIL_MAX_LENGTH} characters`),

  body("password")
    .optional()
    .isLength({ min: 8, max: DB.PASSWORD_MAX_LENGTH })
    .withMessage(
      `Password must be between 8 and ${DB.PASSWORD_MAX_LENGTH} characters`
    ),

  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ min: 10, max: DB.PHONE_MAX_LENGTH })
    .withMessage("Invalid phone number"),

  // Receptionist Fields
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for date of birth"),

  body("gender")
    .optional()
    .isIn(Object.values(Gender))
    .withMessage("Invalid gender"),

  body("address")
    .optional()
    .trim(),

  body("city")
    .optional()
    .trim(),

  body("state")
    .optional()
    .trim(),

  body("country")
    .optional()
    .trim(),

  body("postalCode")
    .optional()
    .trim(),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for joining date"),

  body("shift")
    .optional()
    .isIn(Object.values(Shift))
    .withMessage("Invalid shift"),

  body("profileImage")
    .optional()
    .trim()
    .isLength({ max: DB.PROFILE_IMAGE_MAX_LENGTH })
    .withMessage(`Profile image URL cannot exceed ${DB.PROFILE_IMAGE_MAX_LENGTH} characters`),
];
