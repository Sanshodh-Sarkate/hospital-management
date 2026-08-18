//
const AppDataSource = require('../../config/db');
const Doctor = require('./doctor.entity');
const Appointment = require("../appointments/appointment.entity");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const { Between } = require("typeorm");

const APIFeatures = require("../../common/utils/api-features.util");
const doctorRepository = AppDataSource.getRepository(Doctor);

//  Create Doctor (Transaction)
module.exports.createDoctor = async (manager, doctorData) => {
  const repository = manager.getRepository(Doctor);

  const doctor = repository.create(doctorData);

  return await repository.save(doctor);
};

//   Find Doctor By ID
module.exports.findDoctorById = async (id) => {
  return await doctorRepository.findOne({
    where: {
      id,
    },
    relations: {
      user: true,
      department: true,
    },
  });
};

//  Find Doctor By User ID
module.exports.findDoctorByUserId = async (userId) => {
  return await doctorRepository.findOne({
    where: {
      user: {
        id: userId,
      },
    },
    relations: {
      user: true,
      department: true,
    },
  });
};

//  Find Doctor By License Number
module.exports.findDoctorByLicenseNumber = async (licenseNumber) => {
  return await doctorRepository.findOne({
    where: {
      licenseNumber,
    },
  });
};



//Get All Doctors (With APIFeatures Query Builder)
module.exports.findAllDoctors = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["specialization", "departmentId", "availabilityStatus", "isActive"])
    .search(["specialization", "licenseNumber", "user.firstName", "user.lastName"])
    .sort(["createdAt", "specialization", "experienceYears"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions(
    { isActive: true },
    { user: true, department: true }
  );

  const [doctors, total] = await doctorRepository.findAndCount(findOptions);
  return features.formatResponse(doctors, total);
};

//  Get Doctor Dashboard Metrics
module.exports.getDoctorDashboardMetrics = async (doctorId) => {
  const doctor = await doctorRepository.findOne({
    where: { id: doctorId },
    relations: { user: true },
  });

  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const todayAppointmentsCount = await appointmentRepo.count({
    where: {
      doctor: { id: doctorId },
      appointmentDateTime: Between(startOfDay, endOfDay),
    },
  });

  const todayPendingAppointmentsCount = await appointmentRepo.count({
    where: {
      doctor: { id: doctorId },
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.PENDING,
    },
  });

  const todayConfirmedAppointmentsCount = await appointmentRepo.count({
    where: {
      doctor: { id: doctorId },
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.CONFIRMED,
    },
  });

  const todayCompletedAppointmentsCount = await appointmentRepo.count({
    where: {
      doctor: { id: doctorId },
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.COMPLETED,
    },
  });

  const totalAppointmentsCount = await appointmentRepo.count({
    where: { doctor: { id: doctorId } },
  });

  const totalCompletedAppointmentsCount = await appointmentRepo.count({
    where: {
      doctor: { id: doctorId },
      status: AppointmentStatus.COMPLETED,
    },
  });

  return {
    doctorId: doctor?.id,
    doctorName: doctor?.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : "N/A",
    availabilityStatus: doctor?.availabilityStatus || "AVAILABLE",
    todayAppointmentsCount,
    todayPendingAppointmentsCount,
    todayConfirmedAppointmentsCount,
    todayCompletedAppointmentsCount,
    totalAppointmentsCount,
    totalCompletedAppointmentsCount,
  };
};

//  Get Doctor Appointments By Doctor ID (With APIFeatures)
module.exports.getDoctorAppointmentsByDoctorId = async (doctorId, queryString = {}) => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const features = new APIFeatures(queryString)
    .filter(["status", "appointmentType", "patientId"])
    .search(["reason"])
    .sort(["appointmentDateTime", "createdAt", "status"], { field: "appointmentDateTime", order: "ASC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions(
    { doctor: { id: doctorId } },
    { patient: { user: true } }
  );

  const [appointments, total] = await appointmentRepo.findAndCount(findOptions);
  return features.formatResponse(appointments, total);
};

//  * Update Doctor
module.exports.updateDoctor = async (id, updateData) => {
  await doctorRepository.update(id, updateData);

  return await this.findDoctorById(id);
};

module.exports.updateDoctorWithTransaction = async (
  manager,
  doctorId,
  updateData
) => {

  const repository = manager.getRepository(Doctor);

  await repository.update(doctorId, updateData);

  return await repository.findOne({
    where: {
      id: doctorId,
    },
    relations: {
      user: true,
      department: true,
    },
  });

};
