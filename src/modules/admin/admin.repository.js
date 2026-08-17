const AppDataSource = require("../../config/db");
const Doctor = require("../doctor/doctor.entity");
const Patient = require("../patient/patient.entity");
const Receptionist = require("../receptionist/receptionist.entity");
const Department = require("../department/department.entity");
const Appointment = require("../appointments/appointment.entity");
const Billing = require("../billing/billing.entity");
const Payment = require("../billing/payment.entity");

const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const PaymentStatus = require("../../common/enums/billing-status.enum");
const { Between } = require("typeorm");

const getAdminDashboardMetrics = async () => {
  const doctorRepo = AppDataSource.getRepository(Doctor);
  const patientRepo = AppDataSource.getRepository(Patient);
  const receptionistRepo = AppDataSource.getRepository(Receptionist);
  const departmentRepo = AppDataSource.getRepository(Department);
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const billingRepo = AppDataSource.getRepository(Billing);
  const paymentRepo = AppDataSource.getRepository(Payment);

  // UTC Start and End of today
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  // 1. Staff & Infrastructure Totals
  const totalDoctorsCount = await doctorRepo.count({ where: { isActive: true } });
  const totalPatientsCount = await patientRepo.count({ where: { isActive: true } });
  const totalReceptionistsCount = await receptionistRepo.count({ where: { isActive: true } });
  const totalDepartmentsCount = await departmentRepo.count({ where: { isActive: true } });

  // 2. Today's Appointments & Operational Metrics
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

  const todayCompletedAppointmentsCount = await appointmentRepo.count({
    where: {
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.COMPLETED,
    },
  });

  const todayCancelledAppointmentsCount = await appointmentRepo.count({
    where: {
      appointmentDateTime: Between(startOfDay, endOfDay),
      status: AppointmentStatus.CANCELLED,
    },
  });

  const totalAppointmentsCount = await appointmentRepo.count();

  // 3. Financial & Revenue Metrics
  const totalRevenueResult = await paymentRepo
    .createQueryBuilder("payment")
    .select("SUM(payment.amount)", "totalRevenue")
    .getRawOne();

  const totalRevenueCollected = parseFloat(totalRevenueResult?.totalRevenue || 0);

  const todayRevenueResult = await paymentRepo
    .createQueryBuilder("payment")
    .select("SUM(payment.amount)", "todayRevenue")
    .where("payment.paymentDate >= :startOfDay AND payment.paymentDate <= :endOfDay", {
      startOfDay,
      endOfDay,
    })
    .getRawOne();

  const todayRevenueCollected = parseFloat(todayRevenueResult?.todayRevenue || 0);

  const pendingBillingResult = await billingRepo
    .createQueryBuilder("billing")
    .select("SUM(billing.finalAmount)", "pendingAmount")
    .where("billing.paymentStatus = :status", { status: PaymentStatus.UNPAID })
    .getRawOne();

  const totalPendingInvoiceAmount = parseFloat(pendingBillingResult?.pendingAmount || 0);

  const paidInvoicesCount = await billingRepo.count({
    where: { paymentStatus: PaymentStatus.PAID },
  });

  const pendingInvoicesCount = await billingRepo.count({
    where: { paymentStatus: PaymentStatus.UNPAID },
  });


  // 4. Department Doctor Distribution Breakdown
  const departmentBreakdown = await departmentRepo
    .createQueryBuilder("dept")
    .leftJoin("dept.doctors", "doctor", "doctor.isActive = true")
    .select([
      "dept.id AS id",
      "dept.departmentName AS departmentName",
      "dept.floor AS floor",
      "COUNT(doctor.id) AS doctorCount",
    ])
    .where("dept.isActive = true")
    .groupBy("dept.id")
    .addGroupBy("dept.departmentName")
    .addGroupBy("dept.floor")
    .getRawMany();

  const formattedDepartmentStats = departmentBreakdown.map((dept) => ({
    id: dept.id,
    departmentName: dept.departmentName,
    floor: dept.floor,
    doctorCount: parseInt(dept.doctorCount, 10) || 0,
  }));

  return {
    staffMetrics: {
      totalDoctorsCount,
      totalPatientsCount,
      totalReceptionistsCount,
      totalDepartmentsCount,
    },
    todayOperations: {
      todayAppointmentsCount,
      todayPendingAppointmentsCount,
      todayConfirmedAppointmentsCount,
      todayCompletedAppointmentsCount,
      todayCancelledAppointmentsCount,
      totalAppointmentsCount,
    },
    financialMetrics: {
      totalRevenueCollected,
      todayRevenueCollected,
      totalPendingInvoiceAmount,
      paidInvoicesCount,
      pendingInvoicesCount,
    },
    departmentStats: formattedDepartmentStats,
  };
};

module.exports = {
  getAdminDashboardMetrics,
};
