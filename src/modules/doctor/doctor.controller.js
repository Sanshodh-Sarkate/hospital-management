// CHANGED
const doctorServices  =  require('./doctor.service');
const asyncHandler  =  require('../../common/utils/async-handler');
const { sendSuccess, sendPaginated } = require('../../common/utils/response.util');

// Create Doctor
module.exports.createDoctor = asyncHandler(async (req , res , next ) => {
    const doctor  =   await doctorServices.createDoctor(req.body  ,  req.user.id);
    return sendSuccess(res, 201, "Doctor created successfully", doctor);
});

// CHANGED: Get Doctor Dashboard Metrics
module.exports.getDoctorDashboardMetrics = asyncHandler(async (req, res, next) => {
    const stats = await doctorServices.getDoctorDashboardStats(req.user);
    return sendSuccess(res, 200, "Doctor dashboard metrics retrieved successfully", { stats });
});

// CHANGED: Get My Doctor Profile
module.exports.getMyProfile = asyncHandler(async (req, res, next) => {
    const doctor = await doctorServices.getMyDoctorProfile(req.user.id);
    return sendSuccess(res, 200, "Doctor profile retrieved successfully", { doctor });
});

// CHANGED: Get My Doctor Appointments (Supports APIFeatures query parameters)
module.exports.getMyAppointments = asyncHandler(async (req, res, next) => {
    const appointments = await doctorServices.getMyDoctorAppointments(req.user, req.query);
    return sendPaginated(res, 200, "Doctor appointments retrieved successfully" , appointments);
});

// CHANGED: Get All Doctors (Supports APIFeatures query parameters)
module.exports.getAllDoctors = asyncHandler(async (req , res , next ) => {
    const doctors = await doctorServices.getAllDoctors(req.query);
    return sendPaginated(res, 200, "Doctors fetched successfully", doctors);
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

// Check Doctor Availability (For Receptionists / Patients / Admins)
module.exports.checkDoctorAvailability = asyncHandler(async (req, res) => {
    const result = await doctorServices.checkDoctorAvailability(req.params.id, req.query.dateTime || req.query.appointmentDateTime);
    return sendSuccess(res, 200, "Doctor availability checked successfully", result);
});




