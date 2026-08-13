const userRepository = require("../user/user.repository");
const departmentRepository = require('../department/department.repository')
const doctorRepository = require('./doctor.repository');
const AppDataSource = require("../../config/db");
const AppError = require('../../common/errors/app.error')
const filterObject = require("../../common/utils/filter-object.util")
const { hashPassword, compareHashedPassword } = require('../../common/utils/password.util');
const { checkUserUniqueness } = require('../../common/services/business-validation.service');
const { Result } = require("express-validator");
const Roles = require("../../common/enums/role.enum");


module.exports.createDoctor = async (doctorData, adminId) => {
  // check email and phone uniqueness
  await checkUserUniqueness({
    email: doctorData.email,
    phoneNumber: doctorData.phoneNumber
  });


  // checkDepartment  
  const department = await departmentRepository.findDepartmentById(doctorData.departmentId);
  if (!department) throw new AppError("Department not found", 404);

  // check licence number  
  const existingDoctor = await doctorRepository.findDoctorByLicenseNumber(doctorData.licenseNumber);
  if (existingDoctor) throw new AppError("License number already exists", 409);

  // START THE TRANSCTION  FROM HERE
  return await AppDataSource.transaction(async (manager) => {

    // hash the password 
    const hashedPassword = await hashPassword(doctorData.password);

    // user data that i want insert in the  user table  
    const userData = {
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      email: doctorData.email,
      password: hashedPassword,
      phoneNumber: doctorData.phoneNumber,
      role: Roles.DOCTOR
    }

    const newUser = await userRepository.createNewUserWithTransaction(manager, userData);

    // doctore data that i want insert in the  doctor table  

    const doctorInfo = filterObject(
      doctorData,
      "departmentId",
      "specialization",
      "qualification",
      "experienceYears",
      "licenseNumber",
      "consultationFee",
      "gender",
      "dateOfBirth",
      "address",
      "emergencyContact",
      "profileImage",
      "bio"
    );

    doctorInfo.user = { id: newUser.id };
    doctorInfo.createdBy = { id: adminId };
    const newDoctor = await doctorRepository.createDoctor(manager, doctorInfo);

    return {
      newUser,
      newDoctor
    }


  });

}

module.exports.getAllDoctors = async () => {
  return await doctorRepository.findAllDoctors();
};

module.exports.getDoctorById = async (doctorId) => {

  const doctor = await doctorRepository.findDoctorById(
    doctorId
  );

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return doctor;
};

module.exports.updateDoctor = async (doctorId, updatedDoctorData, adminId) => {
  // check doctor  
  const doctor = await doctorRepository.findDoctorById(doctorId);
  if (!doctor) throw new AppError("Doctor is not found!", 404);

  //checkIf department was update
  if (updatedDoctorData.departmentId && updatedDoctorData.departmentId !== doctor.departmentId) {
    //  const updatedDepartment  =  await  doctorRepository.updateDoctor
    const department =
      await departmentRepository.findDepartmentById(
        updatedDoctorData.departmentId
      );

    if (!department) {
      throw new AppError("Department not found", 404);
    }
  }
  // check email and phone uniqueness
  await checkUserUniqueness({
    email: updatedDoctorData.email,
    phoneNumber: updatedDoctorData.phoneNumber,
    excludeUserId: doctor.user.id
  });

  // 4. Check license number
  if (
    updatedDoctorData.licenseNumber &&
    updatedDoctorData.licenseNumber !== doctor.licenseNumber
  ) {
    const existingDoctor =
      await doctorRepository.findDoctorByLicenseNumber(
        updatedDoctorData.licenseNumber
      );

    if (
      existingDoctor &&
      existingDoctor.id !== doctor.id
    ) {
      throw new AppError(
        "License number already exists",
        409
      );
    }
  }

  // transaction start  
  return await AppDataSource.transaction(async (manager) => {
    //update first user data  table  
    const userData = filterObject(
      updatedDoctorData,
      "firstName",
      "lastName",
      "phoneNumber"
    );

    if (Object.keys(userData).length > 0) {
      await userRepository.updateUserWithTransaction(manager, doctor.user.id, userData);
    }


    // updateDoctor   
    const doctorData = filterObject(
      updatedDoctorData,
      "departmentId",
      "specialization",
      "qualification",
      "experienceYears",
      "licenseNumber",
      "consultationFee",
      "gender",
      "dateOfBirth",
      "address",
      "emergencyContact",
      "profileImage",
      "bio",
      "availabilityStatus"
    );

    doctorData.updatedBy = adminId;

    const updatedDoctor = await doctorRepository.updateDoctorWithTransaction(manager, doctorId, doctorData)

    return updatedDoctor





  });


}


module.exports.deleteDoctor = async (doctorId, adminId) => {
  const doctor = await doctorRepository.findDoctorById(doctorId);

  if (!doctor) throw new AppError("Doctor not found", 404);

  return await AppDataSource.transaction(async (manager) => {
    await userRepository.updateUserWithTransaction(manager, doctor.user.id, {
      isActive: false
    })

    const updateDoctor = await doctorRepository.updateDoctorWithTransaction(manager, doctorId, {

      isActive: false,
      updatedBy: adminId
    })

    return updateDoctor;
  })
}

module.exports.updateDoctorAvailability = async (doctorId , availabilityStatus , adminId)=> {
  const doctor  =  await doctorRepository.findDoctorById(doctorId);

  if(!doctor) throw new AppError("Dctor is not found!" , 404);

  return await doctorRepository.updateDoctor(doctorId , {
    availabilityStatus,
    updatedBy: adminId 
  })
}
