const userRepository = require("../user/user.repository");
const departmentRepository = require('../department/department.repository')
const doctorRepository = require('./doctor.repository');
const AppDataSource = require("../../config/db");
const AppError = require('../../common/errors/app.error')
const filterObject = require("../../common/utils/filter-object.util")
const { hashPassword, compareHashedPassword } = require('../../common/utils/password.util');
const { checkUserUniqueness } = require('../../common/services/business-validation.service');
const { Result } = require("express-validator");
const Roles = require("../../common/enums/role.enum");
const { Not, In } = require("typeorm");
const Appointment = require("../appointments/appointment.entity");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const DoctorAvailability = require("../../common/enums/doctor-availability.enum");


module.exports.createDoctor = async (doctorData, adminId) => {
  // check email and phone uniqueness
  await checkUserUniqueness({
    email: doctorData.email,
    phoneNumber: doctorData.phoneNumber
  });


  // checkDepartment  
  const department = await departmentRepository.findDepartmentById(doctorData.departmentId);
  if (!department) throw new AppError("Department not found", 404);

  // check licence number  
  const existingDoctor = await doctorRepository.findDoctorByLicenseNumber(doctorData.licenseNumber);
  if (existingDoctor) throw new AppError("License number already exists", 409);

  // START THE TRANSCTION  FROM HERE
  return await AppDataSource.transaction(async (manager) => {

    // hash the password 
    const hashedPassword = await hashPassword(doctorData.password);

    // user data that i want insert in the  user table  
    const userData = {
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      email: doctorData.email,
      password: hashedPassword,
      phoneNumber: doctorData.phoneNumber,
      role: Roles.DOCTOR
    }

    const newUser = await userRepository.createNewUserWithTransaction(manager, userData);

    // doctore data that i want insert in the  doctor table  

    const doctorInfo = filterObject(
      doctorData,
      "departmentId",
      "specialization",
      "qualification",
      "experienceYears",
      "licenseNumber",
      "consultationFee",
      "gender",
      "dateOfBirth",
      "address",
      "emergencyContact",
      "profileImage",
      "bio"
    );

    doctorInfo.user = { id: newUser.id };
    doctorInfo.createdBy = { id: adminId };
    const newDoctor = await doctorRepository.createDoctor(manager, doctorInfo);

    return {
      newUser,
      newDoctor
    }


  });

}

//  Get All Doctors (Supports APIFeatures query parameters)
module.exports.getAllDoctors = async (queryString = {}) => {
  return await doctorRepository.findAllDoctors(queryString);
};

// Get Doctor Dashboard Metrics
module.exports.getDoctorDashboardStats = async (user) => {
  const doctor = await doctorRepository.findDoctorByUserId(user.id);
  if (!doctor) throw new AppError("Doctor profile not found", 404);
  return await doctorRepository.getDoctorDashboardMetrics(doctor.id);
};

//  Get My Doctor Profile
module.exports.getMyDoctorProfile = async (userId) => {
  const doctor = await doctorRepository.findDoctorByUserId(userId);
  if (!doctor) throw new AppError("Doctor profile not found", 404);
  return doctor;
};

// Get My Doctor Appointments (With APIFeatures)
module.exports.getMyDoctorAppointments = async (user, queryString = {}) => {
  const doctor = await doctorRepository.findDoctorByUserId(user.id);
  if (!doctor) throw new AppError("Doctor profile not found", 404);
  return await doctorRepository.getDoctorAppointmentsByDoctorId(doctor.id, queryString);
};



module.exports.getDoctorById = async (doctorId) => {

  const doctor = await doctorRepository.findDoctorById(
    doctorId
  );

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return doctor;
};

module.exports.updateDoctor = async (doctorId, updatedDoctorData, adminId) => {
  // check doctor  
  const doctor = await doctorRepository.findDoctorById(doctorId);
  if (!doctor) throw new AppError("Doctor is not found!", 404);

  //checkIf department was update
  if (updatedDoctorData.departmentId && updatedDoctorData.departmentId !== doctor.departmentId) {
    //  const updatedDepartment  =  await  doctorRepository.updateDoctor
    const department =
      await departmentRepository.findDepartmentById(
        updatedDoctorData.departmentId
      );

    if (!department) {
      throw new AppError("Department not found", 404);
    }
  }
  // check email and phone uniqueness
  await checkUserUniqueness({
    email: updatedDoctorData.email,
    phoneNumber: updatedDoctorData.phoneNumber,
    excludeUserId: doctor.user.id
  });

  // 4. Check license number
  if (
    updatedDoctorData.licenseNumber &&
    updatedDoctorData.licenseNumber !== doctor.licenseNumber
  ) {
    const existingDoctor =
      await doctorRepository.findDoctorByLicenseNumber(
        updatedDoctorData.licenseNumber
      );

    if (
      existingDoctor &&
      existingDoctor.id !== doctor.id
    ) {
      throw new AppError(
        "License number already exists",
        409
      );
    }
  }

  // transaction start  
  return await AppDataSource.transaction(async (manager) => {
    //update first user data  table  
    const userData = filterObject(
      updatedDoctorData,
      "firstName",
      "lastName",
      "phoneNumber"
    );

    if (Object.keys(userData).length > 0) {
      await userRepository.updateUserWithTransaction(manager, doctor.user.id, userData);
    }


    // updateDoctor   
    const doctorData = filterObject(
      updatedDoctorData,
      "departmentId",
      "specialization",
      "qualification",
      "experienceYears",
      "licenseNumber",
      "consultationFee",
      "gender",
      "dateOfBirth",
      "address",
      "emergencyContact",
      "profileImage",
      "bio",
      "availabilityStatus"
    );

    doctorData.updatedBy = adminId;

    const updatedDoctor = await doctorRepository.updateDoctorWithTransaction(manager, doctorId, doctorData)

    return updatedDoctor





  });


}


module.exports.deleteDoctor = async (doctorId, adminId) => {
  const doctor = await doctorRepository.findDoctorById(doctorId);

  if (!doctor) throw new AppError("Doctor not found", 404);

  return await AppDataSource.transaction(async (manager) => {
    await userRepository.updateUserWithTransaction(manager, doctor.user.id, {
      isActive: false
    })

    const updateDoctor = await doctorRepository.updateDoctorWithTransaction(manager, doctorId, {

      isActive: false,
      updatedBy: adminId
    })

    return updateDoctor;
  })
}

module.exports.updateDoctorAvailability = async (doctorId , availabilityStatus , adminId)=> {
  const doctor  =  await doctorRepository.findDoctorById(doctorId);

  if(!doctor) throw new AppError("Dctor is not found!" , 404);

  return await doctorRepository.updateDoctor(doctorId , {
    availabilityStatus,
    updatedBy: adminId 
  })
}

// Check Doctor Availability for Receptionists/Patients/Admins
module.exports.checkDoctorAvailability = async (doctorId, dateTime) => {
  const doctor = await doctorRepository.findDoctorById(doctorId);
  if (!doctor) throw new AppError("Doctor not found", 404);

  if (!doctor.isActive) {
    return {
      isAvailable: false,
      reason: "Doctor profile is currently inactive",
      doctor: {
        id: doctor.id,
        name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : "N/A",
        availabilityStatus: doctor.availabilityStatus,
      },
    };
  }

  if (doctor.availabilityStatus !== DoctorAvailability.AVAILABLE) {
    return {
      isAvailable: false,
      reason: `Doctor is currently ${doctor.availabilityStatus}`,
      doctor: {
        id: doctor.id,
        name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : "N/A",
        availabilityStatus: doctor.availabilityStatus,
      },
    };
  }

  if (dateTime) {
    const requestedDate = new Date(dateTime);
    if (isNaN(requestedDate.getTime())) {
      throw new AppError("Invalid dateTime format. Must be a valid ISO date string", 400);
    }

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const existingAppointment = await appointmentRepo.findOne({
      where: {
        doctor: { id: doctorId },
        appointmentDateTime: requestedDate,
        status: Not(In([AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED])),
      },
    });

    if (existingAppointment) {
      return {
        isAvailable: false,
        reason: "Doctor already has a booked appointment at this date and time slot",
        requestedDateTime: requestedDate.toISOString(),
        doctor: {
          id: doctor.id,
          name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : "N/A",
          availabilityStatus: doctor.availabilityStatus,
        },
      };
    }
  }

  return {
    isAvailable: true,
    reason: "Doctor is available for the requested time slot",
    requestedDateTime: dateTime ? new Date(dateTime).toISOString() : null,
    doctor: {
      id: doctor.id,
      name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : "N/A",
      availabilityStatus: doctor.availabilityStatus,
      consultationFee: doctor.consultationFee,
      specialization: doctor.specialization,
      department: doctor.department ? doctor.department.departmentName : null,
    },
  };
};

