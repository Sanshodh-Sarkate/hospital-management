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


// 6. Get All Billings (Admin / Receptionist)
const getAllBillings = async () => {
  return await billingRepository.find({
    relations: defaultRelations,
    order: { createdAt: "DESC" },
  });
};

// 7. Get Billings By Patient ID (Patient Dashboard)
const getBillingsByPatientId = async (patientId) => {
  return await billingRepository.find({
    where: {
      patient: { id: patientId },
    },
    relations: defaultRelations,
    order: { createdAt: "DESC" },
  });
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
