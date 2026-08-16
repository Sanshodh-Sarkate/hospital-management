const AppDataSource  =   require('../../config/db');
const  Patient  =  require('./patient.entity');

const patientRepository  =   AppDataSource.getRepository(Patient);

// Create Patient  use Transaction
const createPatient = async(manager, patientData) => {
    const repository = manager.getRepository(Patient);
    const createNewPatient = repository.create(patientData);
    return await repository.save(createNewPatient);
};

// CHANGED
const APIFeatures = require("../../common/utils/api-features.util");

// CHANGED: Get All Patients (With APIFeatures Query Builder)
const getAllPatients = async (queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["gender", "bloodGroup", "city", "state", "country", "isActive"])
    .search(["address", "emergencyContactName", "user.firstName", "user.lastName", "user.email", "user.phoneNumber"])
    .sort(["createdAt", "gender", "bloodGroup"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions(
    { isActive: true },
    { user: true }
  );

  const [patients, total] = await patientRepository.findAndCount(findOptions);
  return features.formatResponse(patients, total);
};



const getPatientById = async(patientId) => {
    return  await patientRepository.findOne({
        where: {
            id  : patientId
        } , 
        relations: {
            user :  true
        }
    })
}
const findPatientByUserId = async (
  userId
) => {

  return await patientRepository.findOne({
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
const updatePatientWithTransaction = async(manager,patientId,updateData) => {
    const repository  =  manager.getRepository(Patient);
    await repository.update(patientId , updateData)
    return await repository.findOne({
        where: {
            id: patientId
        },
        relations: {
            user: true
        },
    });
}

const deletePatient = async (
  patientId,
  updateData
) => {

  await patientRepository.update(
    patientId,
    updateData
  );

  return await this.findPatientById(patientId);

};


module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    findPatientByUserId,
    updatePatientWithTransaction,
    deletePatient
}