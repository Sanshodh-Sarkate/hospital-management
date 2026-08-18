//
const patientServices = require('./patient.service');
const asyncHandler = require('../../common/utils/async-handler');
const { sendSuccess, sendPaginated } = require('../../common/utils/response.util');

// Public Patient Self-Registration (With Cookie & Token Response)
module.exports.registerPatientSelf = asyncHandler(async (req, res, next) => {
    const result = await patientServices.registerPatientSelf(req.body);
    
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, 201, "Patient account created successfully", result);
});

module.exports.registerPatient = asyncHandler(async (req, res, next) => {
    const patient = await patientServices.registerPatient(req.body, req.user.id);
    return sendSuccess(res, 201, "Patient created successfully", patient);
});

// Get All Patients (Supports APIFeatures query parameters)
module.exports.getAllPatients = asyncHandler(async (req, res, next) => {
    const patients = await patientServices.getAllPatient(req.query);
    return sendPaginated(res, 200, "Patients fetched successfully", patients);
});


module.exports.getPatientById = asyncHandler(async (req, res, next) => {
    const patient = await patientServices.getPatientById(req.params.id);
    return sendSuccess(res, 200, "Patient fetched successfully", patient);
});

module.exports.updatePatient = asyncHandler(async (req, res, next) => {
    const updatedPatient = await patientServices.updatePatient(req.params.id, req.body, req.user.id, req.user.role);
    return sendSuccess(res, 200, "Patient updated successfully", updatedPatient);
});

module.exports.deletePatient = asyncHandler(async (req, res, next) => {
    const deletedPatient = await patientServices.deletePatient(req.params.id, req.user.id);
    return sendSuccess(res, 200, "Patient deleted successfully", deletedPatient);
});


module.exports.getMyProfile = asyncHandler(async (req, res, next) => {
    const patient = await patientServices.getPatientProfile(req.user.id);
    return sendSuccess(res, 200, "patient profile", { patient });
});

module.exports.updateMyProfile = asyncHandler(async (req, res, next) => {
    const updatedPatientData = await patientServices.updateMyProfile(req.user.id, req.body);
    return sendSuccess(res, 200, "Profile updated successfully!", { updatedPatientData });
});

