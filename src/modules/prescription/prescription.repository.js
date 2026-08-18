const AppDataSource = require("../../config/db");
const Prescription = require("./prescription.entity");
const PrescriptionMedication = require("./prescription-medication.entity");

const prescriptionRepository = AppDataSource.getRepository(Prescription);
const prescriptionMedicationRepository = AppDataSource.getRepository(PrescriptionMedication);

// Standard nested relations for loading Doctor User & Patient User
const defaultRelations = {
  appointment: true,
  doctor: {
    user: true,
  },
  patient: {
    user: true,
  },
  prescriptionMedications: true,
  createdBy: true,
  updatedBy: true,
};

// Find Prescription by ID
const getPrescriptionById = async (prescriptionId, manager = null) => {
  const repository = manager ? manager.getRepository(Prescription) : prescriptionRepository;
  return await repository.findOne({
    where: {
      id: prescriptionId,
    },
    relations: defaultRelations,
  });
};

// Find Prescription by Appointment
const getPrescriptionByAppointmentId = async (appointmentId) => {
  return await prescriptionRepository.findOne({
    where: {
      appointment: {
        id: appointmentId,
      },
    },
    relations: defaultRelations,
  });
};

//
const APIFeatures = require("../../common/utils/api-features.util");

//: Get All Prescriptions (With APIFeatures)
const getAllPrescriptions = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["patientId", "doctorId", "appointmentId"])
    .search(["diagnosis", "notes", "advice"])
    .sort(["createdAt", "diagnosis"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({}, defaultRelations);
  const [prescriptions, total] = await prescriptionRepository.findAndCount(findOptions);
  return features.formatResponse(prescriptions, total);
};

//: Get Prescriptions by Patient ID (With APIFeatures)
const getPrescriptionsByPatientId = async (patientId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["doctorId", "appointmentId"])
    .search(["diagnosis", "notes", "advice"])
    .sort(["createdAt", "diagnosis"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ patient: { id: patientId } }, defaultRelations);
  const [prescriptions, total] = await prescriptionRepository.findAndCount(findOptions);
  return features.formatResponse(prescriptions, total);
};

//: Get Prescriptions by Doctor ID (With APIFeatures)
const getPrescriptionsByDoctorId = async (doctorId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["patientId", "appointmentId"])
    .search(["diagnosis", "notes", "advice"])
    .sort(["createdAt", "diagnosis"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ doctor: { id: doctorId } }, defaultRelations);
  const [prescriptions, total] = await prescriptionRepository.findAndCount(findOptions);
  return features.formatResponse(prescriptions, total);
};


// Create Prescription (Transaction)
const createPrescription = async (manager, prescriptionData) => {
  const repository = manager.getRepository(Prescription);
  const prescription = repository.create(prescriptionData);
  return await repository.save(prescription);
};

// Create Prescription Medication (Transaction)
const createPrescriptionMedication = async (manager, medicationData) => {
  const repository = manager.getRepository(PrescriptionMedication);
  const medication = repository.create(medicationData);
  return await repository.save(medication);
};

// Update Prescription (Transaction)
const updatePrescription = async (manager, prescriptionId, updateData) => {
  const repository = manager ? manager.getRepository(Prescription) : prescriptionRepository;
  await repository.update(prescriptionId, updateData);
  return await repository.findOne({
    where: {
      id: prescriptionId,
    },
    relations: defaultRelations,
  });
};

// Delete Prescription (Transaction)
const deletePrescription = async (manager, prescriptionId) => {
  const repository = manager ? manager.getRepository(Prescription) : prescriptionRepository;
  return await repository.delete(prescriptionId);
};

// Find Medication Item by ID
const getMedicationItemById = async (itemId) => {
  return await prescriptionMedicationRepository.findOne({
    where: { id: itemId },
    relations: {
      prescription: {
        doctor: {
          user: true,
        },
      },
    },
  });
};

// Update Medication Item
const updateMedicationItem = async (manager, itemId, updateData) => {
  const repository = manager ? manager.getRepository(PrescriptionMedication) : prescriptionMedicationRepository;
  await repository.update(itemId, updateData);
  return await repository.findOne({ where: { id: itemId } });
};

// Delete Medication Item
const deleteMedicationItem = async (manager, itemId) => {
  const repository = manager ? manager.getRepository(PrescriptionMedication) : prescriptionMedicationRepository;
  return await repository.delete(itemId);
};

module.exports = {
  getPrescriptionById,
  getPrescriptionByAppointmentId,
  getAllPrescriptions,
  getPrescriptionsByPatientId,
  getPrescriptionsByDoctorId,
  createPrescription,
  createPrescriptionMedication,
  updatePrescription,
  deletePrescription,
  getMedicationItemById,
  updateMedicationItem,
  deleteMedicationItem,
};