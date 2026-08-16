// CHANGED
const express = require("express");

const appointmentController = require("./appointments.controller");
const appointmentValidation = require("./appointment.validation");


const authMiddleware = require("../auth/auth.middleware");
const validationRequest = require("../../common/middleware/validation.middleware");
const { validateQueryFeatures } = require("../../common/middleware/query-validation.middleware");
const Roles = require("../../common/enums/appointment-status.enum");
const { RECEPTIONIST } = require("../../common/enums/role.enum");

const router = express.Router();

router.post(
  "/booking",
  authMiddleware.protect,
  authMiddleware.restrictTo("RECEPTIONIST", "PATIENT", "ADMIN"),
  appointmentValidation.createAppointmentValidation,
  validationRequest,
  appointmentController.bookAppointment
);

// CHANGED: Get All Appointments (Supports APIFeatures query parameters)
router.get('/',
  authMiddleware.protect,
  authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"),
  validateQueryFeatures,
  validationRequest,
  appointmentController.getAllAppointments)


router.get('/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"),
  appointmentController.getAppointmentById)


router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"),
  appointmentValidation.updateAppointmentValidation,
  validationRequest,
  appointmentController.updateAppointment
);


//delete  Appointment Softdelete  isActive false  
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    "RECEPTIONIST",
    "ADMIN"
  ),
  appointmentController.deleteAppointment
);


// Confirm Appointment
// Receptionist
router.patch(
  "/:id/confirm",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    "RECEPTIONIST"
  ),
  appointmentController.confirmAppointment
);

// Reject Appointment
// Receptionist
router.patch(
  "/:id/reject",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    "RECEPTIONIST"
  ),
  appointmentValidation.rejectAppointmentValidation,
  validationRequest,
  appointmentController.rejectAppointment
);

// Cancel Appointment
// Receptionist
router.patch(
  "/:id/cancel",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    "RECEPTIONIST" , "PATIENT" , "ADMIN"
  ),
  appointmentValidation.cancelAppointmentValidation,
  validationRequest,
  appointmentController.cancelAppointment
);


// Reschedule Appointment
// Receptionist
router.patch(
  "/:id/reschedule",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    "RECEPTIONIST"
  ),
  appointmentValidation.rescheduleAppointmentValidation,
  validationRequest,
  appointmentController.rescheduleAppointment
);



// Complete Appointment
// Doctor
router.patch(
  "/:id/complete",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    "DOCTOR"
  ),
  appointmentController.completeAppointment
);


module.exports = router;
