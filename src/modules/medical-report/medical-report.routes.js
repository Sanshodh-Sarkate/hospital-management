// CHANGED
const express = require("express");
const router = express.Router();

const medicalReportController = require('./medical-report.controller');
const medicalReportValidation = require("./medical-report.validation");
const authMiddleware = require("../auth/auth.middleware");
const validateRequest = require("../../common/middleware/validation.middleware");
const { validateQueryFeatures } = require("../../common/middleware/query-validation.middleware");
const Roles = require("../../common/enums/role.enum");

router.use(authMiddleware.protect);


// Create Medical Report (Doctor only)
router.post(
  "/",
  authMiddleware.restrictTo(Roles.DOCTOR),
  medicalReportValidation.createMedicalReportValidation,
  validateRequest,
  medicalReportController.createMedicalReport
);

// CHANGED: Get My Medical Reports (Patient, Doctor, Admin, Receptionist)
router.get(
  "/my",
  authMiddleware.restrictTo(
    Roles.PATIENT,
    Roles.DOCTOR,
    Roles.ADMIN,
    Roles.RECEPTIONIST
  ),
  validateQueryFeatures,
  validateRequest,
  medicalReportController.getMyMedicalReports
);

// CHANGED: Get All Medical Reports (Admin, Doctor, Receptionist)
router.get(
  "/",
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST
  ),
  validateQueryFeatures,
  validateRequest,
  medicalReportController.getAllMedicalReports
);

// CHANGED: Get Medical Reports By Appointment
router.get(
  "/appointment/:appointmentId",
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST,
    Roles.PATIENT
  ),
  medicalReportValidation.appointmentIdValidation,
  validateQueryFeatures,
  validateRequest,
  medicalReportController.getAllMedicalReportByAppointmentId
);


// Download Medical Report PDF (Patient, Doctor, Admin, Receptionist)
router.get(
  "/:id/download",
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST,
    Roles.PATIENT
  ),
  medicalReportValidation.medicalReportIdValidation,
  validateRequest,
  medicalReportController.downloadMedicalReportPdf
);

// Get Medical Report By ID
router.get(
  "/:id",
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST,
    Roles.PATIENT
  ),
  medicalReportValidation.medicalReportIdValidation,
  validateRequest,
  medicalReportController.getMedicalReportById
);

// Update Medical Report (Doctor only)
router.patch(
  "/:id",
  authMiddleware.restrictTo(Roles.DOCTOR),
  medicalReportValidation.medicalReportIdValidation,
  medicalReportValidation.updateMedicalReportValidation,
  validateRequest,
  medicalReportController.updateMedicalReport
);

// Delete Medical Report (Admin, Doctor)
router.delete(
  "/:id",
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR
  ),
  medicalReportValidation.medicalReportIdValidation,
  validateRequest,
  medicalReportController.deleteMedicalReport
);

module.exports = router;
