const express =  require('express');
const router  =  express.Router();

const  departmentValidations  =  require('./department.validation');
const  authMiddleware = require('../auth/auth.middleware')
const validateRequest = require("../../common/middleware/validation.middleware")
const departmentcontroller  =  require('./department.controller')

router.post('/' , authMiddleware.protect , authMiddleware.restrictTo("ADMIN"),departmentValidations.createDepartmentValidation ,  validateRequest , departmentcontroller.createDepartment)
router.get('/' ,  authMiddleware.protect , authMiddleware.restrictTo("ADMIN", "DOCTOR", "RECEPTIONIST") , departmentcontroller.getDepartment)
router.get('/:id' ,  authMiddleware.protect , authMiddleware.restrictTo("ADMIN", "DOCTOR", "RECEPTIONIST") , departmentcontroller.getDepartmentById)
router.patch('/:id' ,  authMiddleware.protect , authMiddleware.restrictTo("ADMIN") , departmentValidations.updateDepartmentValidation , validateRequest ,  departmentcontroller.updateDepartment)
router.delete('/:id' ,   authMiddleware.protect , authMiddleware.restrictTo("ADMIN") ,  departmentcontroller.deleteDepartment)

module.exports =  router