const doctorServices  =  require('./doctor.service');
const asyncHandler  =  require('../../common/utils/async-handler')


// Create Doctor
module.exports.createDoctor= asyncHandler(async (req , res , next ) => {
    const doctor  =   await doctorServices.createDoctor(req.body  ,  req.user.id)

     return res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    data: doctor,
  });
})


// Get All Doctorsa
module.exports.getAllDoctors =  asyncHandler(async (req , res , next ) => {
    const doctors  =   await  doctorServices.getAllDoctors()

  return res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
})


// Get Doctor By ID
module.exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor  =  await doctorServices.getDoctorById(req.params.id);

    return res.status(200).json({
    success: true,
    data: doctor,
  });

})

// Update Doctor
module.exports.updateDoctor = asyncHandler(async (req, res) => {
    const updatedDoctor = await doctorServices.updateDoctor(req.params.id , req.body , req.user.id);
 return res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
    data: updatedDoctor,
  });
})

module.exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorServices.deleteDoctor(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
    data: doctor,
  });
});


module.exports.updateDoctorAvailability =  asyncHandler(async (req, res) => { 
  const doctor =  await doctorServices.updateDoctorAvailability(req.params.id , req.body.availabilityStatus, req.user.id)

    return res.status(200).json({
      success: true,
      message: "Doctor availability updated successfully",
      data: doctor,
    });
})


