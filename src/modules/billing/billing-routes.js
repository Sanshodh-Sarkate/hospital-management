const express   =  require("express");
const router =  express.Router();
const billingValidation = require("./billing-validation");
const validateRequest = require("../../common/middleware/validation.middleware");
const billingController  =   require("./billing-controller")
const authMiddleware = require("../auth/auth.middleware");
const Roles = require("../../common/enums/role.enum");  

router.use(authMiddleware.protect);

// Get My Invoices (Patient Dashboard)
router.get('/my' , authMiddleware.restrictTo(Roles.PATIENT),
  billingController.getMyBillings )

// Get All Billings (Admin / Receptionist)
router.get('/', authMiddleware.restrictTo(Roles.ADMIN , Roles.RECEPTIONIST) , 
billingController.getAllBillings);  


// Get Single Invoice (View Details)
router.get('/:id' ,  authMiddleware.restrictTo(Roles.ADMIN, Roles.RECEPTIONIST, Roles.PATIENT), billingController.getBillingById);

// 4. Update / Finalize Invoice (Admin & Receptionist)
router.patch(
  "/:id",
  authMiddleware.restrictTo(Roles.ADMIN, Roles.RECEPTIONIST),
  billingValidation.updateBillingValidation,
  validateRequest,
  billingController.updateBilling
);



module.exports =  router ;  