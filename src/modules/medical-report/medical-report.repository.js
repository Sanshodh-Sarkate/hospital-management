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

// Get All Medical Reports
const getAllMedicalReports = async () => {
  return await medicalReportRepository.find({
    relations: defaultRelations,
    order: {
      generatedAt: "DESC",
    },
  });
};

// Get Medical Reports by Appointment ID
const getMedicalReportsByAppointmentId = async (appointmentId) => {
  return await medicalReportRepository.find({
    where: {
      appointment: {
        id: appointmentId,
      },
    },
    relations: defaultRelations,
    order: {
      generatedAt: "DESC",
    },
  });
};

// Get Medical Reports by Patient ID
const getMedicalReportsByPatientId = async (patientId) => {
  return await medicalReportRepository.find({
    where: {
      patient: {
        id: patientId,
      },
    },
    relations: defaultRelations,
    order: {
      generatedAt: "DESC",
    },
  });
};

// Get Medical Reports by Doctor ID
const getMedicalReportsByDoctorId = async (doctorId) => {
  return await medicalReportRepository.find({
    where: {
      doctor: {
        id: doctorId,
      },
    },
    relations: defaultRelations,
    order: {
      generatedAt: "DESC",
    },
  });
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
