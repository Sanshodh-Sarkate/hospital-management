const doctorServices  =  require('./doctor.service');
const asyncHandler  =  require('../../common/utils/async-handler');
const { sendSuccess } = require('../../common/utils/response.util');

// Create Doctor
module.exports.createDoctor = asyncHandler(async (req , res , next ) => {
    const doctor  =   await doctorServices.createDoctor(req.body  ,  req.user.id);
    return sendSuccess(res, 201, "Doctor created successfully", doctor);
});

// Get All Doctors
module.exports.getAllDoctors = asyncHandler(async (req , res , next ) => {
    const doctors  =   await  doctorServices.getAllDoctors();
    return sendSuccess(res, 200, "Doctors fetched successfully", doctors, { count: doctors.length });
});

// Get Doctor By ID
module.exports.getDoctorById = asyncHandler(async (req, res) => {
    const doctor  =  await doctorServices.getDoctorById(req.params.id);
    return sendSuccess(res, 200, "Doctor fetched successfully", doctor);
});

// Update Doctor
module.exports.updateDoctor = asyncHandler(async (req, res) => {
    const updatedDoctor = await doctorServices.updateDoctor(req.params.id , req.body , req.user.id);
    return sendSuccess(res, 200, "Doctor updated successfully", updatedDoctor);
});

module.exports.deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await doctorServices.deleteDoctor(
        req.params.id,
        req.user.id
    );
    return sendSuccess(res, 200, "Doctor deleted successfully", doctor);
});

module.exports.updateDoctorAvailability = asyncHandler(async (req, res) => { 
    const doctor =  await doctorServices.updateDoctorAvailability(req.params.id , req.body.availabilityStatus, req.user.id);
    return sendSuccess(res, 200, "Doctor availability updated successfully", doctor);
});



