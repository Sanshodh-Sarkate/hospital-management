const AppDataSource = require("../../config/db");
const paymentRepository = require("./payment.repository");
const billingRepository = require("../billing/billing-repository");
const billingServices = require("../billing/billing-services");
const patientRepository = require("../patient/patient.repository");
const AppError = require("../../common/errors/app.error");
const Roles = require("../../common/enums/role.enum");
const BillingStatus = require("../../common/enums/billing-status.enum");
const filterObject = require("../../common/utils/filter-object.util");

// 1. Process Payment against a Bill
const processPayment = async (billingId, paymentData, user) => {
  // Fetch bill with payments relation
  const billing = await billingRepository.getBillingById(billingId);
  if (!billing) {
    throw new AppError("Invoice/Bill was not found", 404);
  }

  // Security Check: Patient can only pay for their own invoice
  if (user.role === Roles.PATIENT) {
    const patient = await patientRepository.findPatientByUserId(user.id);
    if (!patient || billing.patient?.id !== patient.id) {
      throw new AppError("You are not authorized to pay for this invoice", 403);
    }
  }

  // Security Check: Lock if invoice is already fully paid
  if (billing.paymentStatus === BillingStatus.PAID) {
    throw new AppError("Invoice is already fully paid", 400);
  }

  // Calculate current total paid & remaining balance
  const existingPayments = billing.payments || [];
  const currentTotalPaid = existingPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const finalAmount = Number(billing.finalAmount || 0);
  const remainingBalance = Math.max(0, finalAmount - currentTotalPaid);

  // Validate new payment amount
  const newPaymentAmount = Number(paymentData.amount);
  if (isNaN(newPaymentAmount) || newPaymentAmount <= 0) {
    throw new AppError("Payment amount must be greater than 0", 400);
  }

  if (newPaymentAmount > remainingBalance) {
    throw new AppError(
      `Payment amount (${newPaymentAmount.toFixed(2)}) exceeds remaining balance (${remainingBalance.toFixed(2)})`,
      400
    );
  }

  // Filter allowed payment fields
  const filteredPayment = filterObject(
    paymentData,
    "amount",
    "paymentMethod",
    "transactionId",
    "notes",
    "paymentDate"
  );

  let savedPayment;
  let updatedPaymentStatus;

  // Database Transaction
  await AppDataSource.transaction(async (manager) => {
    // Save Payment record inside transaction
    const paymentToSave = {
      ...filteredPayment,
      amount: newPaymentAmount,
      billing: { id: billingId },
    };

    savedPayment = await paymentRepository.createPayment(manager, paymentToSave);

    // Calculate updated total paid & new payment status
    const updatedTotalPaid = currentTotalPaid + newPaymentAmount;

    if (updatedTotalPaid >= finalAmount) {
      updatedPaymentStatus = BillingStatus.PAID;
    } else if (updatedTotalPaid > 0) {
      updatedPaymentStatus = BillingStatus.PARTIALLY_PAID;
    } else {
      updatedPaymentStatus = BillingStatus.UNPAID;
    }

    // Update Billing paymentStatus inside transaction
    await billingRepository.updateBilling(
      billingId,
      { paymentStatus: updatedPaymentStatus },
      manager
    );
  });

  const updatedBill = await billingRepository.getBillingById(billingId);

  return {
    payment: {
      id: savedPayment.id,
      amount: savedPayment.amount,
      paymentMethod: savedPayment.paymentMethod,
      paymentDate: savedPayment.paymentDate,
      transactionId: savedPayment.transactionId,
      notes: savedPayment.notes,
    },
    billing: billingServices.formatBilling(updatedBill),
  };
};

// 2. Get Payments by Billing ID
const getPaymentsByBillingId = async (billingId, user) => {
  const billing = await billingRepository.getBillingById(billingId);
  if (!billing) {
    throw new AppError("Invoice/Bill was not found", 404);
  }

  if (user.role === Roles.PATIENT) {
    const patient = await patientRepository.findPatientByUserId(user.id);
    if (!patient || billing.patient?.id !== patient.id) {
      throw new AppError("You are not authorized to view payments for this invoice", 403);
    }
  }

  const payments = await paymentRepository.getPaymentsByBillingId(billingId);
  return payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    paymentMethod: p.paymentMethod,
    paymentDate: p.paymentDate,
    transactionId: p.transactionId,
    notes: p.notes,
  }));
};

// 3. Get Payment by ID
const getPaymentById = async (paymentId, user) => {
  const payment = await paymentRepository.getPaymentById(paymentId);
  if (!payment) {
    throw new AppError("Payment transaction receipt not found", 404);
  }

  if (user.role === Roles.PATIENT) {
    const patient = await patientRepository.findPatientByUserId(user.id);
    if (!patient || payment.billing?.patient?.id !== patient.id) {
      throw new AppError("You are not authorized to view this payment receipt", 403);
    }
  }

  return {
    id: payment.id,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    transactionId: payment.transactionId,
    notes: payment.notes,
    billing: billingServices.formatBilling(payment.billing),
  };
};


// Get Payment Stats & Summary Dashboard
const getPaymentStatsSummary = async (query) => {
  let startDate = query.startDate ? new Date(query.startDate) : null;
  let endDate = query.endDate ? new Date(query.endDate) : null;

  // Default to TODAY if date range is not provided
  if (!startDate || !endDate) {
    const now = new Date();
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  }

  const { payments, allBillings } = await paymentRepository.getPaymentStats(startDate, endDate);

  // 1. Calculate revenue collected in date range its sum of all payments inside of the payment arrays  
  const totalRevenueCollected = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  // Calculate breakdown by payment method
  const breakdownByMethod = {
    CASH: 0,
    CARD: 0,
    UPI: 0,
    NET_BANKING: 0,
    INSURANCE: 0,
  };

  for (const p of payments) {
    const method = p.paymentMethod;
    if (breakdownByMethod[method] !== undefined) {
      breakdownByMethod[method] += Number(p.amount || 0);
    }
  }

  // Format method breakdown values to 2 decimals
  Object.keys(breakdownByMethod).forEach((key) => {
    breakdownByMethod[key] = Number(breakdownByMethod[key]).toFixed(2);
  });

  // Calculate hospital-wide invoice metrics
  const totalBilledAmount = allBillings.reduce(
    (sum, b) => sum + Number(b.finalAmount || 0),
    0
  );

  let unpaidInvoicesCount = 0;
  let partiallyPaidInvoicesCount = 0;
  let fullyPaidInvoicesCount = 0;

  for (const b of allBillings) {
    if (b.paymentStatus === BillingStatus.PAID) {
      fullyPaidInvoicesCount++;
    } else if (b.paymentStatus === BillingStatus.PARTIALLY_PAID) {
      partiallyPaidInvoicesCount++;
    } else {
      unpaidInvoicesCount++;
    }
  }

  const totalOutstandingBalance = Math.max(0, totalBilledAmount - totalRevenueCollected);

  return {
    period: {
      startDate,
      endDate,
    },
    revenueStats: {
      totalRevenueCollected: totalRevenueCollected.toFixed(2),
      totalTransactionsCount: payments.length,
      breakdownByMethod,
    },
    hospitalOutstandingStats: {
      totalBilledAmount: totalBilledAmount.toFixed(2),
      totalOutstandingBalance: totalOutstandingBalance.toFixed(2),
      invoiceCounts: {
        unpaidInvoicesCount,
        partiallyPaidInvoicesCount,
        fullyPaidInvoicesCount,
      },
    },
  };
};


module.exports = {
  processPayment,
  getPaymentsByBillingId,
  getPaymentById,
  getPaymentStatsSummary
};
