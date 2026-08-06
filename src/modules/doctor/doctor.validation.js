const { body } = require("express-validator");
const  DoctorAvailability =  require('../../common/enums/doctor-availability.enum')


module.exports.createDoctorValidation = [
  // User Details
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),

  // Doctor Details
  body("departmentId")
    .notEmpty()
    .withMessage("Department is required")
    .isUUID()
    .withMessage("Invalid department id"),

  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),

  body("qualification")
    .trim()
    .notEmpty()
    .withMessage("Qualification is required"),

  body("experienceYears")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 0 })
    .withMessage("Experience must be 0 or greater"),

  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required"),

  body("consultationFee")
    .notEmpty()
    .withMessage("Consultation fee is required")
    .isFloat({ min: 0 })
    .withMessage("Consultation fee must be greater than or equal to 0"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required"),

  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("emergencyContact")
    .trim()
    .notEmpty()
    .withMessage("Emergency contact is required"),
];




module.exports.updateDoctorValidation = [
  // User Fields
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("phoneNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty"),

  // Doctor Fields
  body("departmentId")
    .optional()
    .isUUID()
    .withMessage("Invalid department id"),

  body("specialization")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Specialization cannot be empty"),

  body("qualification")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Qualification cannot be empty"),

  body("experienceYears")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be 0 or greater"),

  body("licenseNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License number cannot be empty"),

  body("consultationFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Consultation fee must be greater than or equal to 0"),

  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),

  body("emergencyContact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Emergency contact cannot be empty"),

  body("profileImage")
    .optional()
    .trim(),

  body("bio")
    .optional()
    .trim(),

  body("availabilityStatus")
    .optional()
    .isIn(["AVAILABLE", "BUSY", "ON_LEAVE"])
    .withMessage("Invalid availability status"),
];

module.exports.updateAvailabilityValidation = [
   body("availabilityStatus")
    .notEmpty()
    .withMessage("Availability status is required")
    .isIn(Object.values(DoctorAvailability))
    .withMessage("Invalid availability status")
];

