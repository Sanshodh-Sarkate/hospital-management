const AppDataSource = require("../../config/db");
const Receptionist = require("./receptionist.entity");
const receptionistRepository = AppDataSource.getRepository(Receptionist);
const { Between } = require("typeorm");
const Appointment = require("../appointments/appointment.entity");
const Doctor = require("../doctor/doctor.entity");
const Patient = require("../patient/patient.entity");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const DoctorAvailability = require("../../common/enums/doctor-availability.enum");
const appointmentRepo = AppDataSource.getRepository(Appointment);
const doctorRepo = AppDataSource.getRepository(Doctor);
const patientRepo = AppDataSource.getRepository(Patient);


const registerReceptionist = async (manager, receptionistData) => {
  const repository = manager.getRepository(Receptionist);
  const newReceptionist = repository.create(receptionistData);
  return await repository.save(newReceptionist);
};


const APIFeatures = require("../../common/utils/api-features.util");

// Get All Receptionists (With APIFeatures Query Builder)
const getAllReceptionist = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["shift", "isActive"])
    .search(["employeeId", "qualification", "user.firstName", "user.lastName", "user.email", "user.phoneNumber"])
    .sort(["createdAt", "employeeId", "shift"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions(
    { isActive: true },
    { user: true }
  );

  const [receptionists, total] = await receptionistRepository.findAndCount(findOptions);
  return features.formatResponse(receptionists, total);
};






//  * Get Receptionist By Id
const findReceptionistById = async (
  receptionistId
) => {
  return await receptionistRepository.findOne({
    where: {
      id: receptionistId,
      isActive: true,
    },
    relations: {
      user: true,
      createdBy: true,
      updatedBy: true,
    },
  });
};

//  * Get Receptionist By Employee Id
const findReceptionistByEmployeeId = async (
  employeeId
) => {
  return await receptionistRepository.findOne({
    where: {
      employeeId,
      isActive: true,
    }
    // relations: {
    //   user : true  
    // }
  });
};


//  * Get Last Employee Id
const findLastEmployeeId = async () => {
  const [lastReceptionist] = await receptionistRepository.find({
    select: {
      employeeId: true,
    },
    order: {
      employeeId: "DESC",
    },
    take: 1,
  });
  return lastReceptionist || null;
};

const updateReceptionistWithTransaction = async (manager, receptionistId, updatedData) => {
  const repository = manager.getRepository(Receptionist);
  const updateReceptionist = repository.update(receptionistId, updatedData);
  return await repository.findOne({
    where: {
      id: receptionistId
    },
    relations: {
      user: true
    }

  })

}


const findReceptionistByUserId = async (userId) => {
  return await receptionistRepository.findOne({
    where: {
      user: {
        id: userId,
      },
    },
    relations: {
      user: true,
    },
  });
};



const getDashboardMetrics = async () => {
  const now = new Date();
  // UTC Start of day (2026-08-14T00:00:00.000Z)
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  // UTC End of day (2026-08-14T23:59:59.999Z)
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  // --- Today's Metrics ---
  const todayAppointmentsCount = await appointmentRepo.count({
    where: { appointmentDateTime: Between(startOfDay, endOfDay) },
  });

  const todayPendingAppointmentsCount = await appointmentRepo.count({
    where: {
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.PENDING,
    },
  });

  const todayConfirmedAppointmentsCount = await appointmentRepo.count({
    where: {
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.CONFIRMED,
    },
  });

  // --- Total Overall Metrics (All Dates) ---
  const totalAppointmentsCount = await appointmentRepo.count();

  const totalPendingAppointmentsCount = await appointmentRepo.count({
    where: { status: AppointmentStatus.PENDING },
  });

  const totalConfirmedAppointmentsCount = await appointmentRepo.count({
    where: { status: AppointmentStatus.CONFIRMED },
  });

  const totalCompletedAppointmentsCount = await appointmentRepo.count({
    where: { status: AppointmentStatus.COMPLETED },
  });

  const availableDoctorsCount = await doctorRepo.count({
    where: { isActive: true, availabilityStatus: DoctorAvailability.AVAILABLE },
  });

  const totalPatientsCount = await patientRepo.count({
    where: { isActive: true },
  });

  return {
    todayAppointmentsCount,
    todayPendingAppointmentsCount,
    todayConfirmedAppointmentsCount,
    totalAppointmentsCount,
    totalPendingAppointmentsCount,
    totalConfirmedAppointmentsCount,
    totalCompletedAppointmentsCount,
    availableDoctorsCount,
    totalPatientsCount,
  };
};




module.exports = {
  registerReceptionist,
  getAllReceptionist,
  findReceptionistById,
  findReceptionistByEmployeeId,
  findReceptionistByUserId,
  findLastEmployeeId,
  updateReceptionistWithTransaction,
  getDashboardMetrics,
}