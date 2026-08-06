const express  = require('express');
const doctorController =  require('./doctor.controller')
const validationRequest = require('../../common/middleware/validation.middleware');
const doctorValidations =  require('./doctor.validation');
const authMiddleware =  require('../auth/auth.middleware')

const router  =  express.Router() ;


router.post('/' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN") ,doctorValidations.createDoctorValidation ,  validationRequest ,  doctorController.createDoctor)
router.get('/' ,authMiddleware.protect ,  doctorController.getAllDoctors );
router.get('/:id' , authMiddleware.protect ,doctorController.getDoctorById);
router.patch('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN") ,doctorValidations.updateDoctorValidation ,  validationRequest  ,  doctorController.updateDoctor)
router.patch('/:id/availability' , authMiddleware.protect ,authMiddleware.restrictTo("ADMIN" , "DOCTOR") , doctorValidations.updateAvailabilityValidation, validationRequest ,  doctorController.updateDoctorAvailability)

//this is only set the  isActive =  false 
router.delete('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN") , doctorController.deleteDoctor)  


module.exports =  router ;