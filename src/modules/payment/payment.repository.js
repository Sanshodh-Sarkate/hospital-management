const AppDataSource = require("../../config/db");
const Payment = require("../billing/payment.entity");
const Billing = require("../billing/billing.entity");



const paymentRepository = AppDataSource.getRepository(Payment);

const defaultRelations = {
  billing: {
    patient: {
      user: true,
    },
    appointment: {
      doctor: {
        user: true,
      },
    },
  },
};

// 1. Create Payment (Supports Database Transaction Manager)
const createPayment = async (manager, paymentData) => {
  const repository = manager ? manager.getRepository(Payment) : paymentRepository;
  const payment = repository.create(paymentData);
  return await repository.save(payment);
};

// 2. Get Payment by ID
const getPaymentById = async (paymentId) => {
  return await paymentRepository.findOne({
    where: { id: paymentId },
    relations: defaultRelations,
  });
};

//
const APIFeatures = require("../../common/utils/api-features.util");

//: 3. Get Payments by Billing ID (With APIFeatures Query Builder)
const getPaymentsByBillingId = async (billingId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["paymentMethod", "paymentStatus"])
    .search(["transactionId", "notes"])
    .sort(["paymentDate", "amount"], { field: "paymentDate", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ billing: { id: billingId } }, defaultRelations);
  const [payments, total] = await paymentRepository.findAndCount(findOptions);
  return features.formatResponse(payments, total);
};



const getPaymentStats = async (startDate, endDate) => {
  const queryBuilder = paymentRepository
    .createQueryBuilder("payment")
    .leftJoinAndSelect("payment.billing", "billing");

  if (startDate && endDate) {
    queryBuilder.where(
      "payment.paymentDate >= :startDate AND payment.paymentDate <= :endDate",
      {
        startDate,
        endDate,
      }
    );
  }

  const payments = await queryBuilder.getMany();
  const allBillings = await AppDataSource.getRepository(Billing).find();

  return {
    payments,
    allBillings,
  };
};


module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByBillingId,
  getPaymentStats
};
