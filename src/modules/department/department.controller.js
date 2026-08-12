const departmentServices =  require('./department.services');
const asyncHandler  =  require('../../common/utils/async-handler');
const { sendSuccess } = require('../../common/utils/response.util');

module.exports.createDepartment =  asyncHandler(async(req  , res  , next) => {
    const data  =  await  departmentServices.createNewDepartment( req.user.id , req.body );
    return sendSuccess(res, 200, "Department created successFully", data);
});


module.exports.getDepartment = asyncHandler(async(req  , res  , next) => {
  const departments  =  await  departmentServices.findAllDepartments();
  return sendSuccess(res, 200, "Departments fetched successfully", departments, { count: departments.length });
});

module.exports.getDepartmentById  =  asyncHandler(async(req  , res  , next) => {
    const department  =  await departmentServices.getDepartmentById(req.params.id);
    return sendSuccess(res, 200, "Department fetched successfully", department);
});


module.exports.updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentServices.updateDepartment(
      req.user.id,
      req.params.id,
      req.body
  );
  return sendSuccess(res, 200, "Department updated successfully", department);
});


module.exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await departmentServices.deleteDepartment(
    req.params.id,
    req.user.id
  );
  return sendSuccess(res, 200, "Department deactivated successfully", department);
});