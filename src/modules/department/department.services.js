const departmentRepository = require('../department/department.repository');
const filterObject = require('../../common/utils/filter-object.util')
const AppError = require('../../common/errors/app.error')


module.exports.createNewDepartment = async (userId, departmentData) => {

  // 1. Check duplicate    
  const existingDepartment = await departmentRepository.findDepartmentByName(departmentData.departmentName);
  if (existingDepartment) {
    throw new AppError(
      "Department already exists",
      409
    );
  }


  // 2. Create department
  const filteredData = filterObject(
    departmentData,
    "departmentName",
    "description",
    "floor",
    "defaultConsultationFee",
    "isActive"
  );
  filteredData.createdBy = userId



  const createDepartment = await departmentRepository.createDepartment(filteredData)

  return createDepartment;
}

//: Get All Departments (Supports APIFeatures query parameters)
module.exports.findAllDepartments = async (queryString = {}) => {
  return await departmentRepository.findAllDepartments(queryString);
};



module.exports.getDepartmentById = async (departmentId) => {
  const department = await departmentRepository.findDepartmentById(departmentId);
  if (!department) {
    throw new AppError("Department not found", 404);
  }



  return department;
}

module.exports.updateDepartment = async (userId, departmentId, updatedData) => {
  // 1. find department  
  const department = await departmentRepository.findDepartmentById(departmentId);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  // 2. Check duplicate name (only if name is being updated)
  if (updatedData.departmentName && updatedData.departmentName !== department.departmentName) {
    const existingDepartment = await departmentRepository.findDepartmentByName(updatedData.departmentName);
    if (existingDepartment) {
      throw new AppError("Department already exists", 409);
    }

  }

  // 3. Allow only valid fields
  const filteredData = filterObject(
    updatedData,
    "departmentName",
    "description",
    "floor",
    "defaultConsultationFee",
    "isActive"
  );

  // 4. Add audit field
  filteredData.updatedBy = userId;

  // 5. Update
  const updatedDepartment =
    await departmentRepository.updateDepartment(
      departmentId,
      filteredData
    );

  // 6. Return
  return updatedDepartment;
}


module.exports.deleteDepartment = async (
  departmentId,
  userId
) => {

  // 1. Find department
  const department = await departmentRepository.findDepartmentById(
    departmentId
  );

  // 2. Check exists
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  // 3. Already deleted?
  if (!department.isActive) {
    throw new AppError("Department is already inactive", 400);
  }

  // 4. Soft delete
  const deletedDepartment =
    await departmentRepository.updateDepartment(
      departmentId,
      {
        isActive: false,
        updatedBy: userId,
      }
    );

  // 5. Return
  return deletedDepartment;
};


