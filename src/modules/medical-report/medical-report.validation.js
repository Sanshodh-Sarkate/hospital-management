const { body, param } = require("express-validator");

const MedicalReportType = require(
  "../../common/enums/medical-report-type.enum"
);


// Create Medical Report
const createMedicalReportValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isUUID()
    .withMessage("Appointment ID must be a valid UUID"),

  body("reportName")
    .trim()
    .notEmpty()
    .withMessage("Report name is required")
    .isLength({ max: 150 })
    .withMessage("Report name cannot exceed 150 characters"),

  body("reportType")
    .notEmpty()
    .withMessage("Report type is required")
    .isIn(Object.values(MedicalReportType))
    .withMessage("Invalid medical report type"),

  body("result")
    .trim()
    .notEmpty()
    .withMessage("Report result is required"),

  body("normalRange")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Normal range cannot exceed 100 characters"),

  body("unit")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Unit cannot exceed 50 characters"),

  body("remarks")
    .optional({ nullable: true })
    .trim(),

  body("reportFileUrl")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Report file URL cannot exceed 255 characters"),
];


// Medical Report ID Validation
const medicalReportIdValidation = [
  param("id")
    .isUUID()
    .withMessage("Medical report ID must be a valid UUID"),
];


// Appointment ID Validation
const appointmentIdValidation = [
  param("appointmentId")
    .isUUID()
    .withMessage("Appointment ID must be a valid UUID"),
];


// Update Medical Report
const updateMedicalReportValidation = [
  param("id")
    .isUUID()
    .withMessage("Medical report ID must be a valid UUID"),

  body("reportName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Report name cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Report name cannot exceed 150 characters"),

  body("reportType")
    .optional()
    .isIn(Object.values(MedicalReportType))
    .withMessage("Invalid medical report type"),

  body("result")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Result cannot be empty"),

  body("normalRange")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Normal range cannot exceed 100 characters"),

  body("unit")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Unit cannot exceed 50 characters"),

  body("remarks")
    .optional({ nullable: true })
    .trim(),

  body("reportFileUrl")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Report file URL cannot exceed 255 characters"),
];


module.exports = {
  createMedicalReportValidation,
  medicalReportIdValidation,
  appointmentIdValidation,
  updateMedicalReportValidation,
};