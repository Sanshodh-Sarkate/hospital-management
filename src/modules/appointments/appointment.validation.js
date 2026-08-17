const { body } = require("express-validator");

const AppointmentType = require("../../common/enums/appointment-type.enum");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const Roles = require("../../common/enums/role.enum");

module.exports.createAppointmentValidation = [
  body("patientId")
    .if((value, { req }) => req.user?.role !== Roles.PATIENT)
    .notEmpty()
    .withMessage("Patient ID is required")
    .isUUID()
    .withMessage("Invalid Patient ID format"),


  body("departmentId")
    .notEmpty()
    .withMessage("Department ID is required")
    .isUUID()
    .withMessage("Invalid Department ID format"),

  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isUUID()
    .withMessage("Invalid Doctor ID format"),


  body("appointmentDateTime")
    .notEmpty()
    .withMessage("Appointment date and time is required")
    .isISO8601()
    .withMessage("Invalid date format (must be ISO8601 string, e.g., 2026-08-15T10:00:00Z)")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Appointment date and time must be in the future");
      }
      return true;
    }),

  body("appointmentType")
    .notEmpty()
    .withMessage("Appointment type is required")
    .isIn(Object.values(AppointmentType))
    .withMessage(`Appointment type must be one of: ${Object.values(AppointmentType).join(", ")}`),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason for appointment is required")
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

module.exports.updateAppointmentValidation = [
  body("appointmentDateTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format (must be ISO8601 string, e.g., 2026-08-15T10:00:00Z)")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Appointment date and time must be in the future");
      }
      return true;
    }),

  body("appointmentType")
    .optional()
    .isIn(Object.values(AppointmentType))
    .withMessage(`Appointment type must be one of: ${Object.values(AppointmentType).join(", ")}`),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),

  body("consultationNotes")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(Object.values(AppointmentStatus))
    .withMessage(`Status must be one of: ${Object.values(AppointmentStatus).join(", ")}`),
];



// Reject Appointment Validation
module.exports.rejectAppointmentValidation = [

  body("rejectionReason")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .trim()
    .isLength({
      min: 3,
      max: 1000,
    })
    .withMessage(
      "Rejection reason must be between 3 and 1000 characters"
    ),
];


// Cancel Appointment Validation
module.exports.cancelAppointmentValidation = [

  body("cancellationReason")
    .notEmpty()
    .withMessage("Cancellation reason is required")
    .trim()
    .isLength({
      min: 3,
      max: 1000,
    })
    .withMessage(
      "Cancellation reason must be between 3 and 1000 characters"
    ),
];


// Reschedule Appointment Validation
module.exports.rescheduleAppointmentValidation = [

  body("appointmentDateTime")
    .notEmpty()
    .withMessage("Appointment date and time is required")
    .isISO8601()
    .withMessage("Invalid appointment date and time"),
];


// module.exports = {
//   createAppointmentValidation,
//   updateAppointmentValidation,
//   rejectAppointmentValidation,
//   cancelAppointmentValidation,
//   rescheduleAppointmentValidation
// };
