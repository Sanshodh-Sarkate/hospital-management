const express = require("express");
const receptionistController = require("./receptionist.controller");
const validationRequest = require("../../common/middleware/validation.middleware");
const receptionistValidations = require("./receptionist.validation");
const authMiddleware = require("../auth/auth.middleware");

const router =  express.Router();

router.post('/' ,  authMiddleware.protect ,  authMiddleware.restrictTo("ADMIN") , receptionistValidations.createReceptionistValidation , validationRequest , receptionistController.createReceptionist);
router.get('/' ,  authMiddleware.protect ,  authMiddleware.restrictTo("ADMIN") , receptionistController.getAllReceptionists);
router.get('/:id' ,  authMiddleware.protect ,  authMiddleware.restrictTo("ADMIN") , receptionistController.getReceptionistById);
router.get('/emp/:employeeId' ,  authMiddleware.protect ,  authMiddleware.restrictTo("ADMIN" , "RECEPTIONIST") , receptionistController.getReceptionistByEmployeeId);

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
module.exports =  router  ;  