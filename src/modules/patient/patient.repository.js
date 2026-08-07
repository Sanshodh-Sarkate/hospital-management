const AppDataSource  =   require('../../config/db');
const  Patient  =  require('./patient.entity');

const patientRepository  =   AppDataSource.getRepository(Patient);

// Create Patient  use Transaction
const createPatient = async(manager, patientData) => {
    const repository = manager.getRepository(Patient);
    const createNewPatient = repository.create(patientData);
    return await repository.save(createNewPatient);
};

const getAllPatients  = async() => {
    return await patientRepository.find({
        where: {
            isActive: true
        },
        relations: {
            user : true
        },
        order: {
            createdAt: "DESC"
        }

    })
}
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