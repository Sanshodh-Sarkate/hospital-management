const userRepository = require("../user/user.repository");
const patientRepository = require('./patient.repository')
const AppDataSource = require("../../config/db");
const AppError = require('../../common/errors/app.error')
const filterObject = require("../../common/utils/filter-object.util")
const { hashPassword, compareHashedPassword } = require('../../common/utils/password.util');
const { checkUserUniqueness } = require('../../common/services/business-validation.service');
const Roles = require("../../common/enums/role.enum");


module.exports.registerPatient = async (patientData, logginUserId) => {
  // check emial and phonenumebr 
  await checkUserUniqueness({
    email: patientData.email,
    phoneNumber: patientData.phoneNumber
  });

  //hashed the paaword  
  const hashedPasword = await hashPassword(patientData.password);

  // START THE TRANSACTION  
  return await AppDataSource.transaction(async (manager) => {
    // create the user data 
    const userData = filterObject(
      patientData,
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
    )
    userData.password = hashedPasword;
    userData.role = Roles.PATIENT;

    const newUser = await userRepository.createNewUserWithTransaction(manager, userData);

    // throw new Error("Testing Transaction Rollback");
    // Patient data
    const patientInfo = filterObject(
      patientData,
      "dateOfBirth",
      "gender",
      "bloodGroup",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "emergencyContactName",
      "emergencyContactNumber",
      "emergencyContactRelation",
      "insuranceProvider",
      "insurancePolicyNumber",
      "profileImage"
    );

    patientInfo.user = { id: newUser.id };
    patientInfo.createdBy = { id: logginUserId || newUser.id };

    const newPatient = await patientRepository.createPatient(manager, patientInfo);


    return {
      newUser,
      newPatient,
    };
  })
}

//: Get All Patients (Supports APIFeatures query parameters)
module.exports.getAllPatient = async (queryString = {}) => {
  return await patientRepository.getAllPatients(queryString);
};


module.exports.getPatientById = async (patientId) => {
  const patient = await patientRepository.getPatientById(patientId);

  if (!patient) throw new AppError("Patient was not found", 404)

  return patient;
}


module.exports.updatePatient = async (patientId, patientUpdatedData, logginUserId, userRole = Roles.PATIENT) => {
  const patient = await patientRepository.getPatientById(patientId);
  if (!patient) throw new AppError("Patient was not found", 404);

  // Security Check: Patient role can ONLY update their own profile!
  if (userRole === Roles.PATIENT && patient.user?.id !== logginUserId) {
    throw new AppError("You are not authorized to update another patient's profile", 403);
  }

  // check email and phone uniqueness
  await checkUserUniqueness({

    email: patientUpdatedData.email,
    phoneNumber: patientUpdatedData.phoneNumber,
    excludeUserId: patient.user.id
  });

  //start transactions  

  return await AppDataSource.transaction(async (manager) => {
    //prepare userdata that i update and store in the  useTable  

    const userData = filterObject(
      patientUpdatedData,
      "firstName",
      "lastName",
      "email",
      "phoneNumber"
    );

    if (Object.keys(userData).length > 0) {
      await userRepository.updateUserWithTransaction(manager, patient.user.id, userData);
    }

    //prepare data for the patientTable  
    const patientData = filterObject(
      patientUpdatedData,
      "dateOfBirth",
      "gender",
      "bloodGroup",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "emergencyContactName",
      "emergencyContactNumber",
      "emergencyContactRelation",
      "insuranceProvider",
      "insurancePolicyNumber",
      "profileImage"
    );

    patientData.updatedBy = { id: logginUserId }

    const updatePatient = await patientRepository.updatePatientWithTransaction(manager, patientId, patientData)
    return updatePatient;
  })

}


// patient dashboard related sevice flow  and code 
module.exports.getPatientProfile = async (userId) => {
  const patientProfile = await patientRepository.findPatientByUserId(userId)
  if (!patientProfile) throw new AppError("Patient profile was not found", 404)

  return patientProfile;
}

module.exports.updateMyProfile = async (userId, patientUpdatedData) => {
  const patient = await patientRepository.findPatientByUserId(userId);
  if (!patient) throw new AppError("Patient profile was not found", 404);

  // Calling updatePatient executes the AppDataSource.transaction automatically!
  return await exports.updatePatient(patient.id, patientUpdatedData, userId);
};



module.exports.deletePatient = async (patientId, deletedBy) => {

  // Check patient exists
  const patient = await patientRepository.findPatientById(patientId);

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  // Start Transaction
  return await AppDataSource.transaction(async (manager) => {

    // Deactivate User
    await userRepository.updateUserWithTransaction(
      manager,
      patient.user.id,
      {
        isActive: false,
      }
    );

    // Deactivate Patient
    const deletedPatient =
      await patientRepository.updatePatientWithTransaction(
        manager,
        patientId,
        {
          isActive: false,
          updatedBy: {
            id: deletedBy,
          },
        }
      );

    return deletedPatient;

  });

};