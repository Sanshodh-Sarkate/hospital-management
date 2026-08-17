const express = require("express");
const router = express.Router();
const hospitalController = require("./hospital.controller");
const hospitalValidations = require("./hospital.validation");
const authMiddleware = require("../auth/auth.middleware");
const validationRequest = require("../../common/middleware/validation.middleware");


// 1. Get Hospital Details (Public / Authenticated)
router.get("/", hospitalController.getHospitalDetails);

// 2. Update Hospital Details (ADMIN Only)
router.patch(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("ADMIN"),
  hospitalValidations.updateHospitalValidation,
  validationRequest,
  hospitalController.updateHospitalDetails
);

module.exports = router;
