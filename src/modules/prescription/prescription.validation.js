const { body, param } = require("express-validator");


// Create Prescription Validation
module.exports.createPrescriptionValidation = [

  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isUUID()
    .withMessage("Appointment ID must be a valid UUID"),

  body("diagnosis")
    .trim()
    .notEmpty()
    .withMessage("Diagnosis is required")
    .isLength({ min: 2, max: 1000 })
    .withMessage(
      "Diagnosis must be between 2 and 1000 characters"
    ),

  body("symptoms")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Symptoms cannot exceed 2000 characters"
    ),

  body("advice")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Advice cannot exceed 2000 characters"
    ),

  body("followUpDate")
    .optional()
    .isISO8601()
    .withMessage("Follow-up date must be a valid date"),

  body("medications")
    .isArray({ min: 1 })
    .withMessage(
      "At least one medication is required"
    ),

  body("medications.*.medicineName")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required")
    .isLength({ max: 255 })
    .withMessage(
      "Medicine name cannot exceed 255 characters"
    ),

  body("medications.*.dosage")
    .trim()
    .notEmpty()
    .withMessage("Dosage is required")
    .isLength({ max: 100 })
    .withMessage(
      "Dosage cannot exceed 100 characters"
    ),

  body("medications.*.frequency")
    .trim()
    .notEmpty()
    .withMessage("Frequency is required")
    .isLength({ max: 100 })
    .withMessage(
      "Frequency cannot exceed 100 characters"
    ),

  body("medications.*.duration")
    .trim()
    .notEmpty()
    .withMessage("Duration is required")
    .isLength({ max: 100 })
    .withMessage(
      "Duration cannot exceed 100 characters"
    ),

  body("medications.*.quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity is required")
    .isLength({ max: 50 })
    .withMessage(
      "Quantity cannot exceed 50 characters"
    ),

  body("medications.*.specialInstructions")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Special instructions cannot exceed 2000 characters"
    ),
];

// Item ID Validation
module.exports.itemIdValidation = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .isUUID()
    .withMessage("Item ID must be a valid UUID"),
];

// Update Prescription Item Validation
module.exports.updatePrescriptionItemValidation = [
  body("medicineName")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Medicine name cannot exceed 255 characters"),

  body("dosage")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Dosage cannot exceed 100 characters"),

  body("frequency")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Frequency cannot exceed 100 characters"),

  body("duration")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Duration cannot exceed 100 characters"),

  body("quantity")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Quantity cannot exceed 50 characters"),

  body("specialInstructions")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Special instructions cannot exceed 2000 characters"),
];


// Prescription ID Validation
module.exports.prescriptionIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Prescription ID is required")
    .isUUID()
    .withMessage(
      "Prescription ID must be a valid UUID"
    ),
];


// Update Prescription Validation
module.exports.updatePrescriptionValidation = [

  body("diagnosis")
    .optional()
    .trim()
    .isLength({ min: 2, max: 1000 })
    .withMessage(
      "Diagnosis must be between 2 and 1000 characters"
    ),

  body("symptoms")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Symptoms cannot exceed 2000 characters"
    ),

  body("advice")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Advice cannot exceed 2000 characters"
    ),

  body("followUpDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Follow-up date must be a valid date"
    ),

  body("medications")
    .optional()
    .isArray()
    .withMessage(
      "Medications must be an array"
    ),

  body("medications.*.medicineName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Medicine name cannot be empty")
    .isLength({ max: 255 })
    .withMessage(
      "Medicine name cannot exceed 255 characters"
    ),

  body("medications.*.dosage")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Dosage cannot be empty")
    .isLength({ max: 100 })
    .withMessage(
      "Dosage cannot exceed 100 characters"
    ),

  body("medications.*.frequency")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Frequency cannot be empty")
    .isLength({ max: 100 })
    .withMessage(
      "Frequency cannot exceed 100 characters"
    ),

  body("medications.*.duration")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Duration cannot be empty")
    .isLength({ max: 100 })
    .withMessage(
      "Duration cannot exceed 100 characters"
    ),

  body("medications.*.quantity")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Quantity cannot be empty")
    .isLength({ max: 50 })
    .withMessage(
      "Quantity cannot exceed 50 characters"
    ),

  body("medications.*.specialInstructions")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Special instructions cannot exceed 2000 characters"
    ),
];