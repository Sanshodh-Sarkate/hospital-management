const express = require("express");
const router = express.Router();

const prescriptionController = require("./prescription.controller");
const prescriptionValidation = require("./prescription.validation");

const authMiddleware = require("../auth/auth.middleware");
const validationRequest = require("../../common/middleware/validation.middleware");
const Roles = require("../../common/enums/role.enum");

// Create Prescription (Doctor only)
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo(Roles.DOCTOR),
  prescriptionValidation.createPrescriptionValidation,
  validationRequest,
  prescriptionController.createPrescription
);

// Get My Prescriptions (Patient only - must come before /:id)
router.get(
  "/my",
  authMiddleware.protect,
  authMiddleware.restrictTo(Roles.PATIENT),
  prescriptionController.getMyPrescriptions
);

// Update Prescription Item (Medication - Doctor only)
router.patch(
  "/items/:itemId",
  authMiddleware.protect,
  authMiddleware.restrictTo(Roles.DOCTOR),
  prescriptionValidation.itemIdValidation,
  prescriptionValidation.updatePrescriptionItemValidation,
  validationRequest,
  prescriptionController.updatePrescriptionItem
);

// Delete Prescription Item (Medication - Doctor, Admin)
router.delete(
  "/items/:itemId",
  authMiddleware.protect,
  authMiddleware.restrictTo(Roles.DOCTOR, Roles.ADMIN),
  prescriptionValidation.itemIdValidation,
  validationRequest,
  prescriptionController.deletePrescriptionItem
);

// Get All Prescriptions (Admin, Doctor, Receptionist)
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST
  ),
  prescriptionController.getPrescriptions
);

// Get Prescription By ID (Admin, Doctor, Receptionist, Patient)
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST,
    Roles.PATIENT
  ),
  prescriptionValidation.prescriptionIdValidation,
  validationRequest,
  prescriptionController.getPrescriptionById
);

// Update Prescription (Doctor only)
router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo(Roles.DOCTOR),
  prescriptionValidation.prescriptionIdValidation,
  prescriptionValidation.updatePrescriptionValidation,
  validationRequest,
  prescriptionController.updatePrescription
);

// Delete Prescription (Admin, Doctor)
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR
  ),
  prescriptionValidation.prescriptionIdValidation,
  validationRequest,
  prescriptionController.deletePrescription
);

module.exports = router;