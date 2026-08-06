const AppDataSource  =  require('../../config/db')
const  Doctor  =  require('./doctor.entity');

const doctorRepository =  AppDataSource.getRepository(Doctor);

//  * Create Doctor (Transaction)
module.exports.createDoctor = async (manager, doctorData) => {
  const repository = manager.getRepository(Doctor);

  const doctor = repository.create(doctorData);

  return await repository.save(doctor);
};

//  * Find Doctor By ID
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

//  * Find Doctor By User ID
module.exports.findDoctorByUserId = async (userId) => {
  return await doctorRepository.findOne({
    where: {
      userId,
    },
  });
};

//  * Find Doctor By License Number
module.exports.findDoctorByLicenseNumber = async (licenseNumber) => {
  return await doctorRepository.findOne({
    where: {
      licenseNumber,
    },
  });
};

//  * Get All Doctors
module.exports.findAllDoctors = async () => {
  return await doctorRepository.find({
    where: {
      isActive: true,
    },
    relations: {
      user: true,
      department: true,
    },
    order: {
      createdAt: "DESC",
    },
  });
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