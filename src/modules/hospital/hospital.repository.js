const AppDataSource = require("../../config/db");
const Hospital = require("./hospital.entity");
const hospitalRepository = AppDataSource.getRepository(Hospital);

// 1. Get Hospital Details (Single Hospital Instance)
const getHospitalDetails = async () => {
  return await hospitalRepository.findOne({
    where: {},
    order: { createdAt: "ASC" },
  });
};

// 2. Create Initial Hospital Record (Seed Data)
const createHospital = async (hospitalData) => {
  const hospital = hospitalRepository.create(hospitalData);
  return await hospitalRepository.save(hospital);
};

// 3. Update Hospital Details
const updateHospital = async (id, updateData) => {
  await hospitalRepository.update(id, updateData);
  return await hospitalRepository.findOne({ where: { id } });
};

module.exports = {
  getHospitalDetails,
  createHospital,
  updateHospital,
};
