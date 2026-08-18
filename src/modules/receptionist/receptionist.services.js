const AppDataSource = require("../../config/db");

const receptionistRepository = require("./receptionist.repository");
const userRepository = require("../user/user.repository");

const AppError = require("../../common/errors/app.error")
const Roles = require("../../common/enums/role.enum");

const { hashPassword } = require("../../common/utils/password.util");
const filterObject = require("../../common/utils/filter-object.util");
const { checkUserUniqueness } = require("../../common/services/business-validation.service");
const { generatEmployeeId } = require("../../common/utils/employeeIdGenerator");



// Get Receptionist Dashboard Metrics
module.exports.getReceptionistDashboardStats = async () => {
  return await receptionistRepository.getDashboardMetrics();
};

// Get My Receptionist Profile
module.exports.getMyReceptionistProfile = async (userId) => {
  const receptionist = await receptionistRepository.findReceptionistByUserId(userId);
  if (!receptionist) throw new AppError("Receptionist profile not found", 404);
  return receptionist;
};

// Update My Receptionist Profile (Receptionist Self-Service with Transaction & filterObject)
module.exports.updateMyReceptionistProfile = async (userId, receptionistData) => {
  const receptionist = await receptionistRepository.findReceptionistByUserId(userId);
  if (!receptionist) throw new AppError("Receptionist profile not found", 404);

  // Check email and phone uniqueness
  await checkUserUniqueness({
    email: receptionistData.email,
    phoneNumber: receptionistData.phoneNumber,
    excludeUserId: receptionist.user.id,
  });

  // Database Transaction to update both users & receptionists tables atomically
  return await AppDataSource.transaction(async (manager) => {
    // 1. Separate user table fields
    const userData = filterObject(
      receptionistData,
      "firstName",
      "lastName",
      "email",
      "phoneNumber"
    );

    if (Object.keys(userData).length > 0) {
      await userRepository.updateUserWithTransaction(
        manager,
        receptionist.user.id,
        userData
      );
    }

    // 2. Separate receptionist table fields (Excluding shift - only Admin can assign shifts)
    const receptionistInfo = filterObject(
      receptionistData,
      "dateOfBirth",
      "gender",
      "addressLine1",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "profileImage"
    );

    receptionistInfo.updatedBy = { id: userId };

    const updatedReceptionist = await receptionistRepository.updateReceptionistWithTransaction(
      manager,
      receptionist.id,
      receptionistInfo
    );

    return updatedReceptionist;
  });
};


module.exports.CreateReceptionist = async (receptionistUSerData, adminId) => {
  // check emial  
  await checkUserUniqueness({
    email: receptionistUSerData.email,
    phoneNumber: receptionistUSerData.phoneNumber
  })

  //hashed the password 
  const hashedPassword = await hashPassword(receptionistUSerData.password);

  //latestEmployeeId  
  const latestEmployeeId = await receptionistRepository.findLastEmployeeId()

  //   calculate newEmpId   
  const empId = generatEmployeeId("REC", latestEmployeeId?.employeeId)

  // start transaction  
  return await AppDataSource.transaction(async (manager) => {

    // prepare for the userData  
    const userData = filterObject(
      receptionistUSerData,
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
    )


    userData.password = hashedPassword;
    userData.role = Roles.RECEPTIONIST;

    const newUser = await userRepository.createNewUserWithTransaction(manager, userData);




    //prepare for the receptionist data
    const receptionistInfo = filterObject(
      receptionistUSerData,
      "dateOfBirth",
      "gender",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "joiningDate",
      "shift",
      "profileImage"
    );

    receptionistInfo.employeeId = empId;
    receptionistInfo.user = { id: newUser.id };
    receptionistInfo.createdBy = { id: adminId };

    const newReceptionist = await receptionistRepository.registerReceptionist(manager, receptionistInfo);

    return {
      receptionist: {
        id: newReceptionist.id,
        employeeId: newReceptionist.employeeId,
        gender: newReceptionist.gender,
        dateOfBirth: newReceptionist.dateOfBirth,
        joiningDate: newReceptionist.joiningDate,
        shift: newReceptionist.shift,
        address: newReceptionist.address,
        city: newReceptionist.city,
        state: newReceptionist.state,
        country: newReceptionist.country,
        postalCode: newReceptionist.postalCode,
        profileImage: newReceptionist.profileImage,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
        },
        createdAt: newReceptionist.createdAt,
      },
    };
  })
}


// Get All Receptionists (Supports APIFeatures query parameters)

module.exports.getAllReceptionist = async (queryString = {}) => {
  return await receptionistRepository.getAllReceptionist(queryString);
};


module.exports.getReceptionistById = async (receptionistId) => {
  return await receptionistRepository.findReceptionistById(receptionistId);
}

module.exports.getReceptionistByEmployeeId = async (employeeId) => {

  const receptionist =
    await receptionistRepository.findReceptionistByEmployeeId(
      employeeId
    );

  if (!receptionist) {
    throw new AppError("Receptionist not found", 404);
  }

  return receptionist;

};

module.exports.updateReceptionist = async (
  receptionistId,
  receptionistData,
  adminId
) => {
  const receptionist =
    await receptionistRepository.findReceptionistById(receptionistId);

  if (!receptionist) {
    throw new AppError("Receptionist not found", 404);
  }

  // Check email and phone uniqueness
  await checkUserUniqueness({
    email: receptionistData.email,
    phoneNumber: receptionistData.phoneNumber,
    excludeUserId: receptionist.user.id,
  });

  // Start Transaction
  return await AppDataSource.transaction(async (manager) => {
    // Split User Data
    const userData = filterObject(
      receptionistData,
      "firstName",
      "lastName",
      "email",
      "phoneNumber"
    );

    if (Object.keys(userData).length > 0) {
      await userRepository.updateUserWithTransaction(
        manager,
        receptionist.user.id,
        userData
      );
    }

    // Split Receptionist Data
    const receptionistInfo = filterObject(
      receptionistData,
      "dateOfBirth",
      "gender",
      "addressLine1",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "joiningDate",
      "shift",
      "profileImage"
    );

    receptionistInfo.updatedBy = { id: adminId };

    const updatedReceptionist =
      await receptionistRepository.updateReceptionistWithTransaction(
        manager,
        receptionistId,
        receptionistInfo
      );

    return updatedReceptionist;
  });
};

module.exports.deleteReceptionist = async (receptionistId, deletedBy) => {
  // Check receptionist exists
  const receptionist = await receptionistRepository.findReceptionistById(receptionistId);

  if (!receptionist) {
    throw new AppError("Receptionist not found", 404);
  }

  // Start Transaction
  return await AppDataSource.transaction(async (manager) => {
    // Deactivate associated User
    await userRepository.updateUserWithTransaction(
      manager,
      receptionist.user.id,
      {
        isActive: false,
      }
    );

    // Deactivate Receptionist
    const deletedReceptionist =
      await receptionistRepository.updateReceptionistWithTransaction(
        manager,
        receptionistId,
        {
          isActive: false,
          updatedBy: {
            id: deletedBy,
          },
        }
      );

    return deletedReceptionist;
  });
};

