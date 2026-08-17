// CHANGED
const express  = require('express');
const doctorController =  require('./doctor.controller')
const validationRequest = require('../../common/middleware/validation.middleware');
const { validateQueryFeatures } = require('../../common/middleware/query-validation.middleware');
const doctorValidations =  require('./doctor.validation');
const authMiddleware =  require('../auth/auth.middleware')

const router  =  express.Router() ;


router.post('/' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN") ,doctorValidations.createDoctorValidation ,  validationRequest ,  doctorController.createDoctor)

//  Doctor Dashboard Metrics
router.get(
  "/dashboard-metrics",
  authMiddleware.protect,
  authMiddleware.restrictTo("DOCTOR"),
  doctorController.getDoctorDashboardMetrics
);

//  Get Doctor Self Profile
router.get(
  "/me",
  authMiddleware.protect,
  authMiddleware.restrictTo("DOCTOR"),
  doctorController.getMyProfile
);

//  Get Doctor Self Appointments Schedule (With APIFeatures)
router.get(
  "/me/appointments",
  authMiddleware.protect,
  authMiddleware.restrictTo("DOCTOR"),
  validateQueryFeatures,
  validationRequest,
  doctorController.getMyAppointments
);

// Get All Doctors (Supports APIFeatures query parameters)
router.get('/' ,authMiddleware.protect , validateQueryFeatures, validationRequest, doctorController.getAllDoctors );


// Check Doctor Availability (Accessible to Receptionists, Patients, Admins, Doctors)
router.get(
  "/:id/check-availability",
  authMiddleware.protect,
  doctorController.checkDoctorAvailability
);

router.get('/:id' , authMiddleware.protect ,doctorController.getDoctorById);

router.patch('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN") ,doctorValidations.updateDoctorValidation ,  validationRequest  ,  doctorController.updateDoctor)

router.patch('/:id/availability' , authMiddleware.protect ,authMiddleware.restrictTo("ADMIN" , "DOCTOR", "RECEPTIONIST") , doctorValidations.updateAvailabilityValidation, validationRequest ,  doctorController.updateDoctorAvailability)

//this is only set the  isActive =  false 
router.delete('/:id' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN") , doctorController.deleteDoctor)  


module.exports =  router ;