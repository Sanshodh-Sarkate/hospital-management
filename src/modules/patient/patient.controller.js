// CHANGED
const patientServices = require('./patient.service');
const asyncHandler = require('../../common/utils/async-handler');
const { sendSuccess, sendPaginated } = require('../../common/utils/response.util');

module.exports.registerPatient = asyncHandler(async (req, res, next) => {
    const patient = await patientServices.registerPatient(req.body, req.user.id);
    return sendSuccess(res, 201, "Patient created successfully", patient);
});

// CHANGED: Get All Patients (Supports APIFeatures query parameters)
module.exports.getAllPatients = asyncHandler(async (req, res, next) => {
    const patients = await patientServices.getAllPatient(req.query);
    return sendPaginated(res, 200, "Patients fetched successfully", patients);
});


module.exports.getPatientById = asyncHandler(async (req, res, next) => {
    const patient = await patientServices.getPatientById(req.params.id);
    return sendSuccess(res, 200, "Patient fetched successfully", patient);
});

module.exports.updatePatient = asyncHandler(async (req, res, next) => {
    const updatedPatient = await patientServices.updatePatient(req.params.id, req.body, req.user.id);
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

