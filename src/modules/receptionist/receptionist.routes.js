const express = require("express");
const receptionistController = require("./receptionist.controller");
const validationRequest = require("../../common/middleware/validation.middleware");
const { validateQueryFeatures } = require("../../common/middleware/query-validation.middleware");
const receptionistValidations = require("./receptionist.validation");
const authMiddleware = require("../auth/auth.middleware");
const Roles = require('../../common/enums/role.enum')

const router = express.Router();

router.post('/', authMiddleware.protect, authMiddleware.restrictTo("ADMIN"), receptionistValidations.createReceptionistValidation, validationRequest, receptionistController.createReceptionist);

router.get(
  "/dashboard-metrics",
  authMiddleware.protect,
  authMiddleware.restrictTo(
    Roles.ADMIN,
    Roles.DOCTOR,
    Roles.RECEPTIONIST,
  ),
  receptionistController.getReceptionistDashboard
);

// Receptionist Self Profile Routes
router.get(
  "/me",
  authMiddleware.protect,
  authMiddleware.restrictTo("RECEPTIONIST"),
  receptionistController.getMyProfile
);

// receptinist update own profile  
router.patch(
  "/me",
  authMiddleware.protect,
  authMiddleware.restrictTo("RECEPTIONIST"),
  receptionistValidations.updateReceptionistValidation,
  validationRequest,
  receptionistController.updateMyProfile
);

// Get All Receptionists (Supports APIFeatures query parameters)
router.get('/', authMiddleware.protect, authMiddleware.restrictTo("ADMIN"), validateQueryFeatures, validationRequest, receptionistController.getAllReceptionists);



router.get('/:id', authMiddleware.protect, authMiddleware.restrictTo("ADMIN"), receptionistController.getReceptionistById);

router.get('/emp/:employeeId', authMiddleware.protect, authMiddleware.restrictTo("ADMIN", "RECEPTIONIST"), receptionistController.getReceptionistByEmployeeId);

// update the recepationist   
router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("ADMIN"),
  receptionistValidations.updateReceptionistValidation,
  validationRequest,
  receptionistController.updateReceptionist
);

//soft delete 
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("ADMIN"),
  receptionistController.deleteReceptionist
);
module.exports = router;  