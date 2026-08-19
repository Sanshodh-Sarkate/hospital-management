const AppDataSource = require("../../config/db");
const billingRepository = require("./billing-repository");
const appointmentRepository = require("../appointments/appointment.repository");
const patientRepository = require("../patient/patient.repository");
const medicalReportRepository = require('../medical-report/medical-report.repository')
const AppError = require("../../common/errors/app.error");
const filterObject = require("../../common/utils/filter-object.util")
const Roles = require("../../common/enums/role.enum");
const BillingStatus = require("../../common/enums/billing-status.enum");
const notificationServices = require("../notification/notification.services");
const NotificationType = require("../../common/enums/notification-type.enum");



// Generate Unique Invoice Number
let billSequence = 1;
const generateBillNumber = () => {
  const year = new Date().getFullYear();
  const seqStr = String(billSequence++).padStart(4, "0");
  const timestampSuffix = Date.now().toString().slice(-4);
  return `BILL-${year}-${seqStr}${timestampSuffix}`.slice(0, 50);
};


// DTO Formatter for Billing Response
const formatBilling = (billing) => {
  if (!billing) return null;
  const payments = billing.payments || [];
  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const finalAmount = Number(billing.finalAmount || 0);
  const remainingBalance = Math.max(0, finalAmount - totalPaid);
  return {
    id: billing.id,
    billNumber: billing.billNumber,
    billingDate: billing.billingDate,
    totalAmount: billing.totalAmount,
    discountAmount: billing.discountAmount,
    insuranceProvider: billing.insuranceProvider,
    insurancePolicyNumber: billing.insurancePolicyNumber,
    insuranceCoverageAmount: billing.insuranceCoverageAmount,
    finalAmount: billing.finalAmount,
    totalPaid: totalPaid.toFixed(2),
    remainingBalance: remainingBalance.toFixed(2),
    paymentStatus: billing.paymentStatus,
    notes: billing.notes,
    createdAt: billing.createdAt,
    patient: billing.patient
      ? {
        id: billing.patient.id,
        name: billing.patient.user
          ? `${billing.patient.user.firstName} ${billing.patient.user.lastName}`
          : "N/A",
        gender: billing.patient.gender,
        dateOfBirth: billing.patient.dateOfBirth,
        phoneNumber: billing.patient.user?.phoneNumber || "N/A",
      }
      : null,
    doctor: billing.appointment?.doctor
      ? {
        id: billing.appointment.doctor.id,
        name: billing.appointment.doctor.user
          ? `Dr. ${billing.appointment.doctor.user.firstName} ${billing.appointment.doctor.user.lastName}`
          : "N/A",
        specialization: billing.appointment.doctor.specialization,
      }
      : null,
    appointment: billing.appointment
      ? {
        id: billing.appointment.id,
        appointmentDateTime: billing.appointment.appointmentDateTime,
      }
      : null,
    billingItems: (billing.billingItems || []).map((item) => ({
      id: item.id,
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
      transactionId: p.transactionId,
      notes: p.notes,
    })),
  };
};


// Automatic Bill Generation on Appointment Completion
module.exports.generateBillingForAppointment = async (appointmentId, manager) => {
  //  Check duplicate billing
  const existingBill = await billingRepository.getBillingByAppointmentId(appointmentId);
  if (existingBill) return existingBill;

  // 2. Fetch appointment with Doctor & Patient relations
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment was not found for billing", 404);
  }


  // 3. Fetch related Medical Reports
  //: Unwrap items array from paginated APIFeatures response object
  const reportsResult = await medicalReportRepository.getMedicalReportsByAppointmentId(appointmentId);
  const medicalReports = Array.isArray(reportsResult) ? reportsResult : (reportsResult?.items || []);

  const billingItems = [];

  // Item 1: Doctor Consultation Fee
  const consultationFee = Number(appointment.doctor?.consultationFee || 0);
  billingItems.push({
    itemName: "Doctor Consultation Fee",
    description: "Consultation fee charged for the appointment",
    quantity: 1,
    unitPrice: consultationFee,
    totalPrice: consultationFee,
  });


  // Items 2..N: Medical Report Charges (where reportCharge > 0)
  for (const report of medicalReports) {

    const charge = Number(report.reportCharge || 0);
    if (charge > 0) {
      billingItems.push({
        itemName: report.reportName || "Medical Report Charge",
        description: "Medical report/test charge",
        quantity: 1,
        unitPrice: charge,
        totalPrice: charge,
      });
    }
  }

  //calculate amount 
  const totalAmount = billingItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );
  const discountAmount = 0;
  const insuranceCoverageAmount = 0;
  const finalAmount = totalAmount - discountAmount - insuranceCoverageAmount;
  const paymentStatus = BillingStatus.UNPAID;

  const billNumber = generateBillNumber();
  const newBillingData = {
    billNumber,
    totalAmount,
    discountAmount,
    insuranceCoverageAmount,
    finalAmount,
    billingDate: new Date(),
    paymentStatus,
    notes: "Auto-generated invoice on appointment completion",
    appointment: { id: appointment.id },
    patient: { id: appointment.patient.id },
  };

  const saveBilling = await billingRepository.createBilling(manager, newBillingData);

  // link and save billingItems  
  const itemsTosave = billingItems.map((item) => ({
    ...item,
    billing: { id: saveBilling.id }
  }))

  await billingRepository.createBillingItems(manager, itemsTosave);

  //  Auto-notify Patient when invoice is generated
  await notificationServices.notifyUser(
    appointment.patient?.user?.id,
    "New Invoice Generated 🧾",
    `Invoice ${billNumber} for ₹${finalAmount.toFixed(2)} has been generated for your appointment.`,
    NotificationType.BILLING,
    { billingId: saveBilling.id, billNumber }
  );


  const finalBilling = await billingRepository.getBillingById(saveBilling.id);
  return formatBilling(finalBilling);

}



// Get Bill By ID
module.exports.getBillingById = async (billingId, user) => {
  const billing = await billingRepository.getBillingById(billingId);
  if (!billing) {
    throw new AppError("Invoice/Bill was not found", 404);
  }
  if (user.role === Roles.PATIENT) {
    const patient = await patientRepository.findPatientByUserId(user.id);
    if (!patient || billing.patient.id !== patient.id) {
      throw new AppError("You are not authorized to view this bill", 403);
    }
  }
  return formatBilling(billing);
};
// Get All Bills (Admin / Receptionist)
//: Get All Bills (Admin / Receptionist With APIFeatures)
module.exports.getAllBillings = async (queryString = {}) => {
  const result = await billingRepository.getAllBillings(queryString);
  result.items = (result.items || []).map(formatBilling);
  return result;
};

//: Get My Bills (Patient Self-Service With APIFeatures)
module.exports.getMyBillings = async (user, queryString = {}) => {
  const patient = await patientRepository.findPatientByUserId(user.id);
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }
  const result = await billingRepository.getBillingsByPatientId(patient.id, queryString);
  result.items = (result.items || []).map(formatBilling);
  return result;
};



// Update / Finalize Bill (Receptionist & Admin)
module.exports.updateBilling = async (billingId, updateData, user) => {
  const billing = await billingRepository.getBillingById(billingId);
  if (!billing) throw new AppError("Invoice/Bill was not found", 404);


  // Security Check: Prevent modifying fully PAID invoices
  if (billing.paymentStatus === BillingStatus.PAID) {
    throw new AppError("Fully paid invoices cannot be modified", 400);
  }

  // 1. Filter allowed fields from update request
  const filteredBody = filterObject(
    updateData,
    "discountAmount",
    "insuranceProvider",
    "insurancePolicyNumber",
    "insuranceCoverageAmount",
    "notes"
  );

  let additionalTotal = 0;
  const newItemsToSave = [];

  if (Array.isArray(updateData.additionalItems) && updateData.additionalItems.length > 0) {
    for (const item of updateData.additionalItems) {
      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = parseFloat(item.unitPrice || 0);
      const totalPrice = qty * unitPrice;
      additionalTotal += totalPrice;
      newItemsToSave.push({
        itemName: item.itemName,
        description: item.description || null,
        quantity: qty,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        billing: { id: billingId },
      });
    }
  }


  //  Calculate updated totals
  const currentTotalAmount = Number(billing.totalAmount || 0);
  const newTotalAmount = currentTotalAmount + additionalTotal;
  const discountAmount = filteredBody.discountAmount !== undefined
    ? Number(filteredBody.discountAmount)
    : Number(billing.discountAmount || 0);
  const insuranceCoverageAmount = filteredBody.insuranceCoverageAmount !== undefined
    ? Number(filteredBody.insuranceCoverageAmount)
    : Number(billing.insuranceCoverageAmount || 0);
  const finalAmount = Math.max(0, newTotalAmount - discountAmount - insuranceCoverageAmount);
  const updateFields = {
    ...filteredBody,
    totalAmount: newTotalAmount,
    discountAmount,
    insuranceCoverageAmount,
    finalAmount,
  };
  // Database Transaction
  await AppDataSource.transaction(async (manager) => {
    // Save new billing items 
    if (newItemsToSave.length > 0) {
      await billingRepository.createBillingItems(manager, newItemsToSave);
    }
    // Update bill
    await billingRepository.updateBilling(billingId, updateFields, manager);
  });
  const updatedBill = await billingRepository.getBillingById(billingId);
  return formatBilling(updatedBill);
};

module.exports.formatBilling = formatBilling;






