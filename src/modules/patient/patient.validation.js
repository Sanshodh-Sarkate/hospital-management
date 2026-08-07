const { body } = require("express-validator");

const DB = require("../../common/constants/database.constants");

const Gender = require("../../common/enums/gender.enum");
const BloodGroup = require("../../common/enums/bloodGrp.entity");

module.exports.createPatientValidation = [

  // User Details
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

  // Patient Details
  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(Object.values(Gender))
    .withMessage("Invalid gender"),

  body("bloodGroup")
    .notEmpty()
    .withMessage("Blood group is required")
    .isIn(Object.values(BloodGroup))
    .withMessage("Invalid blood group"),

  // Address
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

  // Emergency Contact
  body("emergencyContactName")
    .trim()
    .notEmpty()
    .withMessage("Emergency contact name is required"),

  body("emergencyContactNumber")
    .trim()
    .notEmpty()
    .withMessage("Emergency contact number is required")
    .isLength({ min: 10, max: DB.PHONE_MAX_LENGTH })
    .withMessage("Invalid emergency contact number"),

  body("emergencyContactRelation")
    .trim()
    .notEmpty()
    .withMessage("Emergency contact relation is required"),

  // Optional Fields
  body("insuranceProvider")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Insurance provider is too long"),

  body("insurancePolicyNumber")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Insurance policy number is too long"),

  body("profileImage")
    .optional()
    .trim(),
];

module.exports.updatePatientValidation = [

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

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  body("gender")
    .optional()
    .isIn(Object.values(Gender))
    .withMessage("Invalid gender"),

  body("bloodGroup")
    .optional()
    .isIn(Object.values(BloodGroup))
    .withMessage("Invalid blood group"),

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

  body("emergencyContactName")
    .optional()
    .trim(),

  body("emergencyContactNumber")
    .optional()
    .trim()
    .isLength({ min: 10, max: DB.PHONE_MAX_LENGTH })
    .withMessage("Invalid emergency contact number"),

  body("emergencyContactRelation")
    .optional()
    .trim(),

  body("insuranceProvider")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Insurance provider is too long"),

  body("insurancePolicyNumber")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Insurance policy number is too long"),

  body("profileImage")
    .optional()
    .trim(),
];