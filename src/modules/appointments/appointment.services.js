const AppDataSource = require("../../config/db");
const userRepository = require("../user/user.repository")
const appointmentRepository = require("./appointment.repository");
const patientRepository = require("../patient/patient.repository");
const doctorRepository = require("../doctor/doctor.repository");
const receptionistRepository = require("../receptionist/receptionist.repository");

const AppError = require("../../common/errors/app.error");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const DoctorAvailability = require("../../common/enums/doctor-availability.enum");
const Roles = require("../../common/enums/role.enum");
const filterObject = require("../../common/utils/filter-object.util");
const { transcode } = require("node:buffer");


// Book the appointment  
module.exports.createAppointment = async (appointmentData, user) => {
  // 1. Validate authenticated user
  const existingUser = await userRepository.findUserById(user.id);
  if (!existingUser) throw new AppError("User not found", 404);

  // 2. Validate patient existence
  let patient;
  if (user.role === Roles.PATIENT) {
    patient = await patientRepository.findPatientByUserId(existingUser.id);
    if (!patient) throw new AppError("Patient profile not found for logged-in user", 404);
  } else {
    if (!appointmentData.patientId) {
      throw new AppError("Patient ID is required", 400);
    }
    patient = await patientRepository.getPatientById(appointmentData.patientId);
    if (!patient) throw new AppError("Patient not found", 404);
  }

  // 3. Validate doctor existence
  const doctor = await doctorRepository.findDoctorById(appointmentData.doctorId);
  if (!doctor) throw new AppError("Doctor not found!", 404);

  // 4. Validate appointmentDateTime is provided, valid, and not in the past
  if (!appointmentData.appointmentDateTime || isNaN(new Date(appointmentData.appointmentDateTime).getTime())) {
    throw new AppError("Invalid appointment date and time format", 400);
  }
  if (new Date(appointmentData.appointmentDateTime) <= new Date()) {
    throw new AppError("Appointment date and time must be in the future", 400);
  }

  // 5. Prepare Appointment Data using filterObject
  const appointmentInfo = filterObject(
    appointmentData,
    "appointmentDateTime",
    "appointmentType",
    "reason"
  );
  appointmentInfo.appointmentDateTime = new Date(appointmentData.appointmentDateTime);

  // Backend controlled fields
  appointmentInfo.patient = patient;
  appointmentInfo.doctor = doctor;
  appointmentInfo.createdBy = { id: existingUser.id };

  // 6. Handle Receptionist profile lookup & validation
  if (user.role === Roles.RECEPTIONIST) {
    const receptionist = await receptionistRepository.findReceptionistByUserId(existingUser.id);
    if (!receptionist) {
      throw new AppError("Receptionist profile not found", 404);
    }
    appointmentInfo.receptionist = receptionist;
  }

  // 7. Set status: RECEPTIONIST/ADMIN creates as CONFIRMED, PATIENT creates as PENDING
  if (user.role === Roles.RECEPTIONIST || user.role === Roles.ADMIN) {
    appointmentInfo.status = AppointmentStatus.CONFIRMED;
  } else {
    appointmentInfo.status = AppointmentStatus.PENDING;
  }

  // 8. Execute Conflict Checks & Save inside the SAME DB Transaction to prevent race conditions
  return await AppDataSource.transaction(async (manager) => {
    // Check Doctor's existing appointment slot inside transaction
    const existingDoctorAppointment = await appointmentRepository.findDoctorAppointment(
      manager,
      appointmentData.doctorId,
      appointmentData.appointmentDateTime
    );
    if (existingDoctorAppointment && existingDoctorAppointment.status !== AppointmentStatus.CANCELLED) {
      throw new AppError("Doctor is already booked for this date and time slot", 409);
    }

    // Check Patient's existing appointment slot inside transaction
    const existingPatientAppointment = await appointmentRepository.findPatientAppointment(
      manager,
      patient.id,
      appointmentData.appointmentDateTime
    );
    if (existingPatientAppointment && existingPatientAppointment.status !== AppointmentStatus.CANCELLED) {
      throw new AppError("Patient already has an appointment booked at this date and time slot", 409);
    }

    // Create & Save Appointment
    return await appointmentRepository.createAppointment(manager, appointmentInfo);
  });
};


// Retrive all apppintment 
module.exports.getAllAppointments = async () => {
  return await appointmentRepository.getAllAppointments();
};


module.exports.getAppointmentById = async (appointmentId) => {
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  return appointment;
};


module.exports.updateAppointment = async (appointmentId, appointmentData, user) => {
  // 1. Find existing appointment
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment not found", 404);

  // 2. Validate Appointment Status
  if (
    appointment.status === AppointmentStatus.CANCELLED ||
    appointment.status === AppointmentStatus.REJECTED ||
    appointment.status === AppointmentStatus.COMPLETED
  ) {
    throw new AppError("This appointment cannot be updated", 400);
  }

  // 3. Prepare Appointment Data using filterObject
  const appointmentInfo = filterObject(
    appointmentData,
    "appointmentDateTime",
    "appointmentType",
    "reason",
    "consultationNotes",
    "status"
  );

  // 4. Validate Appointment Date & Time if updating time
  if (appointmentData.appointmentDateTime) {
    const appointmentDateTime = new Date(appointmentData.appointmentDateTime);

    if (isNaN(appointmentDateTime.getTime())) {
      throw new AppError("Invalid appointment date and time format", 400);
    }

    if (appointmentDateTime <= new Date()) {
      throw new AppError("Appointment date and time must be in the future", 400);
    }

    appointmentInfo.appointmentDateTime = appointmentDateTime;
  }

  // 5. Execute Conflict Checks & Update inside DB Transaction
  return await AppDataSource.transaction(async (manager) => {
    if (appointmentData.appointmentDateTime) {
      // DOCTOR CONFLICT CHECK
      const existingDoctorAppointment = await appointmentRepository.findDoctorAppointment(
        manager,
        appointment.doctor.id,
        appointmentData.appointmentDateTime
      );

      if (
        existingDoctorAppointment &&
        existingDoctorAppointment.id !== appointment.id &&
        [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(existingDoctorAppointment.status)
      ) {
        throw new AppError("Doctor is already booked for this date and time slot", 409);
      }

      // PATIENT CONFLICT CHECK
      const existingPatientAppointment = await appointmentRepository.findPatientAppointment(
        manager,
        appointment.patient.id,
        appointmentData.appointmentDateTime
      );

      if (
        existingPatientAppointment &&
        existingPatientAppointment.id !== appointment.id &&
        [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(existingPatientAppointment.status)
      ) {
        throw new AppError("Patient already has an appointment booked at this date and time slot", 409);
      }
    }

    appointmentInfo.updatedBy = {
      id: user.id,
    };

    return await appointmentRepository.updateAppointmentWithTransaction(manager, appointmentId, appointmentInfo);
  });
};


module.exports.deleteAppointment = async (appointmentId, user) => {
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment is not found !", 404);

  // 2. Validate Appointment Status
  if (
    appointment.status === AppointmentStatus.COMPLETED
  ) {
    throw new AppError(
      "Completed appointment cannot be deleted",
      400
    );
  }

  // START THE TRANSACTION   
  return await AppDataSource.transaction(async (manager) => {
    //soft delete 
    const appointmentInfo = {
      isActive: false,
      updatedBy: {
        id: user.id,
      }
    }

    return await appointmentRepository.updateAppointmentWithTransaction(manager, appointmentId, appointmentInfo)
  });
}

// confirm the appointment  
module.exports.confirmAppointment = async (appointmentId, user) => {
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment is not found !", 404);

  // Validate Current Status
  if (appointment.status !== AppointmentStatus.PENDING) {
    throw new AppError("Only pending appointments can be confirmed", 400);
  }

  // Check Doctor Active Status
  if (!appointment.doctor || !appointment.doctor.isActive) {
    throw new AppError("Doctor is currently inactive or not found", 400);
  }

  // Check Doctor Availability Status
  if (appointment.doctor.availabilityStatus !== DoctorAvailability.AVAILABLE) {
    throw new AppError(
      `Doctor is currently ${appointment.doctor.availabilityStatus.toLowerCase().replace('_', ' ')} and cannot be assigned`,
      400
    );
  }

  // prepare updated data  
  const appointmentInfo = {
    status: AppointmentStatus.CONFIRMED,
    updatedBy: {
      id: user.id
    }
  };

  return await AppDataSource.transaction(async (manager) => {
    const existingDoctorAppointment = await appointmentRepository.findDoctorAppointment(manager, appointment.doctor.id, appointment.appointmentDateTime);
    if (existingDoctorAppointment && existingDoctorAppointment.id !== appointment.id &&
        existingDoctorAppointment.status === AppointmentStatus.CONFIRMED) { 
      throw new AppError("Doctor is already booked for this time slot by another confirmed appointment", 409);
    }

    return await appointmentRepository.updateAppointmentWithTransaction(manager, appointmentId, appointmentInfo);
  });
};


// Reject appointment
module.exports.rejectAppointment = async (
  appointmentId,
  user,
  rejectionReason
) => {

  // 1. Find Appointment
  const appointment =
    await appointmentRepository.getAppointmentById(
      appointmentId
    );

  if (!appointment) {
    throw new AppError(
      "Appointment not found",
      404
    );
  }


  // 2. Validate Current Status

  if (
    appointment.status !== AppointmentStatus.PENDING
  ) {
    throw new AppError(
      "Only pending appointments can be rejected",
      400
    );
  }


  // 3. Validate Rejection Reason

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new AppError(
      "Rejection reason is required",
      400
    );
  }


  // 4. Prepare Update Data

  const appointmentInfo = {
    status: AppointmentStatus.REJECTED,

    cancellationReason: rejectionReason.trim(),

    updatedBy: {
      id: user.id,
    },
  };


  // 5. Update Appointment

  return await AppDataSource.transaction(
    async (manager) => {

      return await appointmentRepository.updateAppointment(
        manager,
        appointmentId,
        appointmentInfo
      );

    }
  );
};

module.exports.cancleAppointment = async (appointmentId, user, cancellationReason) => {
  // 1. Find Appointment
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment not found", 404);

  if (user.role === Roles.PATIENT && appointment.patient?.user?.id !== user.id) {
    throw new AppError("You do not have permission to cancel this appointment", 403);
  }

  // 2. Validate Current Status PENDING CONFIRM cancle its for the patient 
  if (appointment.status === AppointmentStatus.CANCELLED) throw new AppError("Appointment is already cancelled", 400);

  if (appointment.status === AppointmentStatus.REJECTED) throw new AppError("Rejected appointment cannot be cancelled", 400);


  if (appointment.status === AppointmentStatus.COMPLETED) throw new AppError("Completed appointment cannot be cancelled", 400)


  // 3. Validate Cancellation Reason
  if (!cancellationReason || !cancellationReason.trim()) throw new AppError("Cancellation reason is required", 400);

  // 4. Prepare Update Data

  const appointmentInfo = {
    status: AppointmentStatus.CANCELLED,

    cancellationReason:
      cancellationReason.trim(),

    updatedBy: {
      id: user.id,
    },
  };

  const updatedAppointment = await AppDataSource.transaction(async (manager) => {
    return await appointmentRepository.updateAppointmentWithTransaction(manager, appointmentId, appointmentInfo);
  });

  return {
    id: updatedAppointment.id,
    status: updatedAppointment.status,
    cancellationReason: updatedAppointment.cancellationReason,
    appointmentDateTime: updatedAppointment.appointmentDateTime,
    updatedAt: updatedAppointment.updatedAt
  };
}


module.exports.rescheduleAppointment = async (appointmentId, newAppointmentDateTime, user) => {

  // Find Appointment
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment not found", 404);

  // Validate Current Status
  if (appointment.status === AppointmentStatus.CANCELLED ||
    appointment.status === AppointmentStatus.COMPLETED ||
    appointment.status === AppointmentStatus.REJECTED
  ) {
    throw new AppError("This appointment cannot be rescheduled", 400);
  }

  // Validate New Date & Time
  if (!newAppointmentDateTime || isNaN(new Date(newAppointmentDateTime).getTime())) {
    throw new AppError("Invalid appointment date and time", 400);
  }

  const newDateTime = new Date(newAppointmentDateTime);
  if (newDateTime <= new Date()) {
    throw new AppError("New appointment date and time must be in the future", 400);
  }

  // Start Transaction
  return await AppDataSource.transaction(async (manager) => {

    // Check Doctor Conflict
    const existingDoctorAppointment = await appointmentRepository.findDoctorAppointment(manager, appointment.doctor.id, newDateTime);
    if (existingDoctorAppointment && existingDoctorAppointment.id !== appointment.id &&
      [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(existingDoctorAppointment.status)
    ) {
      throw new AppError(
        "Doctor is already booked for this date and time slot",
        409
      );
    }
    //  Check Patient Conflict
    const existingPatientAppointment =
      await appointmentRepository.findPatientAppointment(
        manager,
        appointment.patient.id,
        newDateTime
      );

    if (
      existingPatientAppointment &&
      existingPatientAppointment.id !== appointment.id &&
      [
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED
      ].includes(
        existingPatientAppointment.status
      )
    ) {
      throw new AppError(
        "Patient already has an appointment at this date and time",
        409
      );
    }


    // Prepare Update Data
    const appointmentInfo = {
      appointmentDateTime: newDateTime,
      updatedBy: {
        id: user.id,
      },
    };


    //Update Appointment

    return await appointmentRepository.updateAppointmentWithTransaction(
      manager,
      appointmentId,
      appointmentInfo
    );
  }
  );
};

module.exports.getMyAppointments = async(userId) => {
  const patient  =   await patientRepository.findPatientByUserId(userId);
  if(!patient) throw new AppError("patient profile was not found!" , 404) ;

  const appointments =  await appointmentRepository.getAppointmentByPatientId(patient.id);

  // format data for patient view
  const formattedAppointments = (appointments || []).map((apt) => ({
      id: apt.id,
      appointmentDateTime: apt.appointmentDateTime,
      appointmentType: apt.appointmentType,
      status: apt.status,
      reason: apt.reason,
      consultationNotes: apt.consultationNotes || null,
      cancellationReason: apt.cancellationReason || null,
      doctor: {
          id: apt.doctor?.id,
          name: apt.doctor?.user 
              ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`
              : "N/A",
          specialization: apt.doctor?.specialization || null,
          department: apt.doctor?.department?.name || null
      }
  }));
  return formattedAppointments;
}


module.exports.completeAppointment = async (
  appointmentId,
  user
) => {

  //  Find Appointment
  const appointment =
    await appointmentRepository.getAppointmentById(
      appointmentId
    );

  if (!appointment) {
    throw new AppError(
      "Appointment not found",
      404
    );
  }

  // Validate Current Status

  if (
    appointment.status !== AppointmentStatus.CONFIRMED
  ) {
    throw new AppError(
      "Only confirmed appointments can be completed",
      400
    );
  }


  // Prepare Update Data

  const appointmentInfo = {
    status: AppointmentStatus.COMPLETED,

    updatedBy: {
      id: user.id,
    },
  };


  //  Update Appointment

  return await AppDataSource.transaction(
    async (manager) => {

      return await appointmentRepository.updateAppointment(
        manager,
        appointmentId,
        appointmentInfo
      );

    }
  );
};