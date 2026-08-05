const departmentServices =  require('./department.services');
const asyncHandler  =  require('../../common/utils/async-handler');

module.exports.createDepartment =  asyncHandler(async(req  , res  , next) => {
    const data  =  await  departmentServices.createNewDepartment( req.user.id , req.body );

    return res.status(200).json ({
        success: true ,
        message: "Department created successFully",
        data 
    })
})


module.exports.getDepartment = asyncHandler(async(req  , res  , next) => {
  const departments  =  await  departmentServices.findAllDepartments();
    return res.status(200).json({
    success: true,
    count: departments.length,
    data: departments,
  });
})

module.exports.getDepartmentById  =  asyncHandler(async(req  , res  , next) => {
    const department  =  await departmentServices.getDepartmentById(req.params.id)

  return res.status(200).json({
    success: true,
    data: department,
  });
});


module.exports.updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentServices.updateDepartment(
      req.user.id,
      req.params.id,
      req.body
  );

  return res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
});


module.exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await departmentServices.deleteDepartment(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: "Department deactivated successfully",
    data: department,
  });
});