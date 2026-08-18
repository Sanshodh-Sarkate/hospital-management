const express = require('express');
const validationRequest = require('../../common/middleware/validation.middleware');
const patientValidations = require('./patient.validation');
const authMiddleware = require('../auth/auth.middleware');
const patientController = require('./patient.controller');
const appointmentController = require("../appointments/appointments.controller");
const appointmentValidations = require('../appointments/appointment.validation')


const router = express.Router();

// Specific routes must come before parameterized routes (/:id)
router.get('/me', authMiddleware.protect, authMiddleware.restrictTo("PATIENT"), patientController.getMyProfile);

router.patch('/me', authMiddleware.protect, authMiddleware.restrictTo("PATIENT"), patientValidations.updatePatientValidation, validationRequest, patientController.updateMyProfile);

//
const { validateQueryFeatures } = require("../../common/middleware/query-validation.middleware");

// Patient Dashboard: View Own Appointments (Supports APIFeatures query parameters)
router.get(
  '/me/appointments',
  authMiddleware.protect,
  authMiddleware.restrictTo("PATIENT"),
  validateQueryFeatures,
  validationRequest,
  appointmentController.getMyAppointments
);
router.post('/booking/appointment',
  authMiddleware.protect,
  authMiddleware.restrictTo("PATIENT"),
  appointmentValidations.createAppointmentValidation, validationRequest, appointmentController.bookAppointment)



router.post('/', authMiddleware.protect, authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"), patientValidations.createPatientValidation, validationRequest, patientController.registerPatient);
//: Get All Patients (Supports APIFeatures query parameters)
router.get('/', authMiddleware.protect, authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"), validateQueryFeatures, validationRequest, patientController.getAllPatients);

router.get('/:id', authMiddleware.protect, authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"), patientController.getPatientById);
router.patch('/:id', authMiddleware.protect, authMiddleware.restrictTo("ADMIN", "RECEPTIONIST", "PATIENT"), patientValidations.updatePatientValidation, validationRequest, patientController.updatePatient);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"), patientController.deletePatient);


module.exports = router;
