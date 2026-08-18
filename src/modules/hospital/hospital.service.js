const hospitalRepository = require("./hospital.repository");
const AppError = require("../../common/errors/app.error");

// Default Single Hospital Seed Data
const DEFAULT_HOSPITAL_DATA = {
  name: "Apex LifeCare Super Speciality Hospital",
  code: "HOSP-APEX-001",
  tagline: "Excellence in Healthcare & Patient Wellness",
  description: "A state-of-the-art multi-speciality tertiary care hospital offering advanced clinical services, 24/7 emergency response, intensive care units, and specialized surgery suites.",
  email: "info@apexlifecarehospital.com",
  phone: "+91 9876543210",
  emergencyPhone: "+91 9876500911",
  address: "100 Medical Campus Road, Near City Circle",
  city: "Ahmedabad",
  state: "Gujarat",
  country: "India",
  postalCode: "380009",
  website: "https://www.apexlifecarehospital.com",
  establishedYear: 2012,
  totalBeds: 350,
  operatingHours: "24 Hours Emergency, OPD: 09:00 AM - 08:00 PM (Mon-Sat)",
  logoUrl: "/uploads/hospital-logo.png",
};

// 1. Get Hospital Details (Auto-seed if empty)
module.exports.getHospital = async () => {
  let hospital = await hospitalRepository.getHospitalDetails();
  if (!hospital) {
    hospital = await hospitalRepository.createHospital(DEFAULT_HOSPITAL_DATA);
  } else if (hospital.name.includes("Sanshodh")) {
    hospital = await hospitalRepository.updateHospital(hospital.id, DEFAULT_HOSPITAL_DATA);
  }
  return hospital;
};


// 2. Update Hospital Details (ADMIN Only)
module.exports.updateHospital = async (updateData) => {
  let hospital = await hospitalRepository.getHospitalDetails();
  if (!hospital) {
    hospital = await hospitalRepository.createHospital({
      ...DEFAULT_HOSPITAL_DATA,
      ...updateData,
    });
    return hospital;
  }

  return await hospitalRepository.updateHospital(hospital.id, updateData);
};
