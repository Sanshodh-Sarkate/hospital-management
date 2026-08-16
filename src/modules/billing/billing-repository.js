const AppDataSource = require("../../config/db");
const Billing = require("./billing.entity");
const BillingItem = require("./billing-item.entity");
const Payment = require("./payment.entity");
const billingRepository = AppDataSource.getRepository(Billing);
const billingItemRepository = AppDataSource.getRepository(BillingItem);
const paymentRepository = AppDataSource.getRepository(Payment);


// billingId, type, amount, paymentDate, paymentMethod, paymentStatus, transactionId, description
const  defaultRelations = {
    patient :  {
        user: true  
    },
    appointment : {
       
        doctor: {
            user: true 
        }
    },
    billingItems: true,
    payments: true

};

// 1. Create Billing Header (Transaction Support)
const createBilling = async (manager, billingData) => {
  const repository = manager ? manager.getRepository(Billing) : billingRepository;
  const newBilling = repository.create(billingData);
  return await repository.save(newBilling);
};

// 2. Create Billing Items
const  createBillingItems  =  async(manager , billingItemData) => {
    const  repository  =  manager ? manager.getRepository(BillingItem) : billingItemRepository ;
    const newItems =  repository.create(billingItemData);
    return  await repository.save(newItems);
}

// 3. Create Payment
const createPayment =  async (manager ,  paymentData) => {
    const  repository  =  manager ? manager.getRepository(Payment) : paymentRepository;
    const newPayment  =  repository.create(paymentData) ;
    return await  repository.save(newPayment);
}

// 4. Get Billing By ID
const getBillingById = async (billingId) => {
  return await billingRepository.findOne({
    where: { id: billingId },
    relations: defaultRelations,
  });
};

// 5. Get Billing By Appointment ID (To prevent duplicate bills)
const getBillingByAppointmentId = async (appointmentId) => {
  return await billingRepository.findOne({
    where: {
      appointment: { id: appointmentId },
    },
    relations: defaultRelations,
  });
};


// CHANGED
const APIFeatures = require("../../common/utils/api-features.util");

// CHANGED: 6. Get All Billings (With APIFeatures Query Builder)
const getAllBillings = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["paymentStatus", "patientId", "appointmentId"])
    .search(["billNumber", "notes"])
    .sort(["createdAt", "finalAmount", "paymentStatus"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({}, defaultRelations);
  const [billings, total] = await billingRepository.findAndCount(findOptions);
  return features.formatResponse(billings, total);
};

// CHANGED: 7. Get Billings By Patient ID (Patient Dashboard With APIFeatures Scope)
const getBillingsByPatientId = async (patientId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["paymentStatus", "appointmentId"])
    .search(["billNumber", "notes"])
    .sort(["createdAt", "finalAmount", "paymentStatus"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ patient: { id: patientId } }, defaultRelations);
  const [billings, total] = await billingRepository.findAndCount(findOptions);
  return features.formatResponse(billings, total);
};


// 8. Update Billing Status / Details (Transaction Support)
const updateBilling = async (billingId, updateData, manager) => {
  const repository = manager ? manager.getRepository(Billing) : billingRepository;
  await repository.update(billingId, updateData);
  
  return await repository.findOne({
    where: { id: billingId },
    relations: defaultRelations,
  });
};


module.exports = {
  createBilling,
  createBillingItems,
  createPayment,
  getBillingById,
  getBillingByAppointmentId,
  getAllBillings,
  getBillingsByPatientId,
  updateBilling,
};
