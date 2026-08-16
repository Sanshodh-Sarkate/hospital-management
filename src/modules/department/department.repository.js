const AppDataSource =   require('../../config/db')
const Department = require('../department/department.entity');

const departmentRepository =  AppDataSource.getRepository(Department);

module.exports.createDepartment  = async(departmentData) => {
    const createNewDepartment  =  await departmentRepository.create(departmentData);
      return await departmentRepository.save(createNewDepartment);
}

module.exports.findDepartmentById  =  async(id) => {
    return await  departmentRepository.findOne({
        where: {id}
    });
}

module.exports.findDepartmentByName = async (departmentName) => {
  return await departmentRepository.findOne({
    where: { departmentName },
  });
};

// CHANGED
const APIFeatures = require("../../common/utils/api-features.util");

// CHANGED: Get All Departments (With APIFeatures Query Builder)
module.exports.findAllDepartments = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["isActive"])
    .search(["departmentName", "description"])
    .sort(["departmentName", "createdAt"], { field: "departmentName", order: "ASC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ isActive: true });
  const [departments, total] = await departmentRepository.findAndCount(findOptions);
  return features.formatResponse(departments, total);
};




module.exports.updateDepartment = async (id, updateData) => {
  await departmentRepository.update(id, updateData);
  return await this.findDepartmentById(id);
};

module.exports.deleteDepartment = async (id) => {
  await departmentRepository.update(id, {
    isActive: false,
  });

  return await this.findDepartmentById(id);
};
