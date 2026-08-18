const AppDataSource = require("../../config/db");
const MedicalReport = require("./medical-report.entity");

const medicalReportRepository = AppDataSource.getRepository(MedicalReport);

const defaultRelations = {
  appointment: true,
  patient: {
    user: true,
  },
  doctor: {
    user: true,
  },
  generatedBy: true,
  updatedBy: true,
};

// Get Medical Report by ID
const getMedicalReportById = async (reportId) => {
  return await medicalReportRepository.findOne({
    where: {
      id: reportId,
    },
    relations: defaultRelations,
  });
};

//
const APIFeatures = require("../../common/utils/api-features.util");

//: Get All Medical Reports (With APIFeatures)
const getAllMedicalReports = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["patientId", "doctorId", "appointmentId"])
    .search(["reportName", "reportType", "reportSummary", "labNotes"])
    .sort(["generatedAt", "createdAt"], { field: "generatedAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({}, defaultRelations);
  const [reports, total] = await medicalReportRepository.findAndCount(findOptions);
  return features.formatResponse(reports, total);
};

//: Get Medical Reports by Appointment ID (With APIFeatures)
const getMedicalReportsByAppointmentId = async (appointmentId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["patientId", "doctorId"])
    .search(["reportName", "reportType", "reportSummary"])
    .sort(["generatedAt", "createdAt"], { field: "generatedAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ appointment: { id: appointmentId } }, defaultRelations);
  const [reports, total] = await medicalReportRepository.findAndCount(findOptions);
  return features.formatResponse(reports, total);
};

//: Get Medical Reports by Patient ID (With APIFeatures)
const getMedicalReportsByPatientId = async (patientId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["doctorId", "appointmentId"])
    .search(["reportName", "reportType", "reportSummary"])
    .sort(["generatedAt", "createdAt"], { field: "generatedAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ patient: { id: patientId } }, defaultRelations);
  const [reports, total] = await medicalReportRepository.findAndCount(findOptions);
  return features.formatResponse(reports, total);
};

//: Get Medical Reports by Doctor ID (With APIFeatures)
const getMedicalReportsByDoctorId = async (doctorId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["patientId", "appointmentId"])
    .search(["reportName", "reportType", "reportSummary"])
    .sort(["generatedAt", "createdAt"], { field: "generatedAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ doctor: { id: doctorId } }, defaultRelations);
  const [reports, total] = await medicalReportRepository.findAndCount(findOptions);
  return features.formatResponse(reports, total);
};


// Create Medical Report
const createMedicalReport = async (medicalReportData) => {
  const report = medicalReportRepository.create(medicalReportData);
  return await medicalReportRepository.save(report);
};

// Update Medical Report
const updateMedicalReport = async (reportId, medicalReportUpdatedData) => {
  await medicalReportRepository.update(reportId, medicalReportUpdatedData);
  return await getMedicalReportById(reportId);
};

// Delete Medical Report
const deleteMedicalReport = async (reportId) => {
  return await medicalReportRepository.delete(reportId);
};

module.exports = {
  getMedicalReportById,
  getAllMedicalReports,
  getMedicalReportsByAppointmentId,
  getMedicalReportsByPatientId,
  getMedicalReportsByDoctorId,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
};
