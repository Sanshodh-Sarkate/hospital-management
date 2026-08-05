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

module.exports.findAllDepartments = async () => {
  return await departmentRepository.find({
      where: {
      isActive: true,
    },
    order: {
      departmentName: "ASC",
    },
  });
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
