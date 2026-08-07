const express  = require('express');
const validationRequest = require('../../common/middleware/validation.middleware');
const patientValidations =  require('./patient.validation');
const authMiddleware =  require('../auth/auth.middleware')
const  patientController = require('./patient.controller');

const router  =  express.Router() ;

router.post('/' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN" , "RECEPTIONIST") , patientValidations.createPatientValidation , validationRequest , patientController.registerPatient)
router.get('/' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN" , "RECEPTIONIST")  , patientController.getAllPatients)
router.get('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN" , "RECEPTIONIST") , patientController.getPatientById)
router.patch('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN" , "RECEPTIONIST") , patientValidations.updatePatientValidation , validationRequest , patientController.updatePatient)
router.delete('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN" , "RECEPTIONIST") ,  patientController.deletePatient)

module.exports =  router  ;   

 
