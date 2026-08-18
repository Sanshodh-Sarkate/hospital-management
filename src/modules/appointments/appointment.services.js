const AppDataSource = require("../../config/db");
const userRepository = require("../user/user.repository")
const appointmentRepository = require("./appointment.repository");
const patientRepository = require("../patient/patient.repository");
const doctorRepository = require("../doctor/doctor.repository");
const receptionistRepository = require("../receptionist/receptionist.repository");
const departmentRepository = require("../department/department.repository");
const billingServices = require("../billing/billing-services");

const AppError = require("../../common/errors/app.error");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const DoctorAvailability = require("../../common/enums/doctor-availability.enum");
const Roles = require("../../common/enums/role.enum");
const filterObject = require("../../common/utils/filter-object.util");
const notificationServices = require("../notification/notification.services");
const NotificationType = require("../../common/enums/notification-type.enum");
const { parseDate } = require("../../common/utils/date.util");


// Helper to parse wall-clock appointment date & time without timezone shifting
const parseWallClockDateTime = (dateInput) => {
  if (!dateInput) return null;
  const str = String(dateInput).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const [, year, month, day, hours, minutes, seconds = '00'] = match;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return new Date(dateInput);
};

// Date Formatter Helper for Notifications (prevents timezone shift bugs)
const formatAppointmentDate = (dateInput) => {
  if (!dateInput) return "";

  if (typeof dateInput === 'string') {
    const match = dateInput.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hoursStr, minutesStr] = match;
      let hours = parseInt(hoursStr, 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedHours = String(hours).padStart(2, '0');
      return `${day}/${month}/${year} at ${formattedHours}:${minutesStr} ${ampm}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} at ${formattedHours}:${minutes} ${ampm}`;
};



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

  // 3. Validate department existence
  if (!appointmentData.departmentId) {
    throw new AppError("Department ID is required", 400);
  }
  const department = await departmentRepository.findDepartmentById(appointmentData.departmentId);
  if (!department) throw new AppError("Department not found!", 404);
  if (department.isActive === false) {
    throw new AppError("Department is currently inactive", 400);
  }

  // 4. Validate doctor existence
  const doctor = await doctorRepository.findDoctorById(appointmentData.doctorId);
  if (!doctor) throw new AppError("Doctor not found!", 404);

  // Validate doctor belongs to the specified department
  if (doctor.department?.id && doctor.department.id !== department.id) {
    throw new AppError("Selected doctor does not belong to the specified department", 400);
  }

  // 5. Validate appointmentDateTime is provided, valid, and not in the past
  const appointmentDateTime = parseDate(appointmentData.appointmentDateTime);
  if (appointmentDateTime <= new Date()) {
    throw new AppError("Appointment date and time must be in the future", 400);
  }

  // 5. Prepare Appointment Data using filterObject
  const appointmentInfo = filterObject(
    appointmentData,
    "appointmentType",
    "reason"
  );
  appointmentInfo.appointmentDateTime = appointmentDateTime;


  // Backend controlled fields
  appointmentInfo.department = department;
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
      appointmentDateTime
    );
    if (
      existingDoctorAppointment &&
      [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED].includes(existingDoctorAppointment.status)
    ) {
      throw new AppError("Doctor is already booked for this date and time slot", 409);
    }

    // Check Patient's existing appointment slot inside transaction
    const existingPatientAppointment = await appointmentRepository.findPatientAppointment(
      manager,
      patient.id,
      appointmentDateTime
    );
    if (
      existingPatientAppointment &&
      [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED].includes(existingPatientAppointment.status)
    ) {
      throw new AppError("Patient already has an appointment booked at this date and time slot", 409);
    }

    // Create & Save Appointment
    const savedAppointment = await appointmentRepository.createAppointment(manager, appointmentInfo);

    // 🔔 1. Auto-notify Patient when appointment is booked
    await notificationServices.notifyUser(
      patient.user?.id,
      "Appointment Booked ",
      `Your appointment with Dr. ${doctor.user?.firstName || "Doctor"} is booked for ${new Date(savedAppointment.appointmentDateTime).toLocaleDateString()}.`,
      NotificationType.APPOINTMENT,
      { appointmentId: savedAppointment.id }
    );

    //  2. Auto-notify ALL Active Receptionists at the front desk
    await notificationServices.notifyRole(
      Roles.RECEPTIONIST,
      "New Pending Appointment",
      `Patient ${patient.user?.firstName || "A patient"} requested an appointment with Dr. ${doctor.user?.firstName || "Doctor"} for ${new Date(savedAppointment.appointmentDateTime).toLocaleDateString()}.`,
      NotificationType.APPOINTMENT,
      { appointmentId: savedAppointment.id, patientId: patient.id }
    );




    return {
      id: savedAppointment.id,
      appointmentDateTime: savedAppointment.appointmentDateTime,
      appointmentType: savedAppointment.appointmentType,
      status: savedAppointment.status,
      reason: savedAppointment.reason,
      consultationNotes: savedAppointment.consultationNotes || null,
      cancellationReason: savedAppointment.cancellationReason || null,
      department: {
        id: department.id,
        departmentName: department.departmentName,
      },
      patient: {
        id: patient.id,
        name: patient.user ? `${patient.user.firstName} ${patient.user.lastName}`.trim() : "N/A",
        phoneNumber: patient.user?.phoneNumber || null,
      },
      doctor: {
        id: doctor.id,
        name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`.trim() : "N/A",
        specialization: doctor.specialization || null,
      },
      createdAt: savedAppointment.createdAt,
    };
  });
};


// Retrive all apppintment 
//: Get All Appointments (With APIFeatures Query Parameters)
module.exports.getAllAppointments = async (queryString = {}) => {
  return await appointmentRepository.getAllAppointments(queryString);
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

  // Validate Patient Ownership & Allowed Status if user is a Patient
  if (user.role === Roles.PATIENT) {
    if (appointment.patient?.user?.id !== user.id) {
      throw new AppError("You do not have permission to confirm this appointment", 403);
    }
    if (appointment.status !== AppointmentStatus.RESCHEDULED) {
      throw new AppError("Patients can only confirm rescheduled appointments", 400);
    }
  }

  // Validate Current Status
  if (
    appointment.status !== AppointmentStatus.PENDING &&
    appointment.status !== AppointmentStatus.RESCHEDULED
  ) {
    throw new AppError("Only pending or rescheduled appointments can be confirmed", 400);
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

  const confirmedAppointment = await AppDataSource.transaction(async (manager) => {
    const existingDoctorAppointment = await appointmentRepository.findDoctorAppointment(manager, appointment.doctor.id, appointment.appointmentDateTime);
    if (existingDoctorAppointment && existingDoctorAppointment.id !== appointment.id &&
      existingDoctorAppointment.status === AppointmentStatus.CONFIRMED) {
      throw new AppError("Doctor is already booked for this time slot by another confirmed appointment", 409);
    }

    return await appointmentRepository.updateAppointmentWithTransaction(manager, appointmentId, appointmentInfo);
  });

  // 1. Auto-notify Patient AFTER transaction finishes
  await notificationServices.notifyUser(
    appointment.patient?.user?.id,
    "Appointment Confirmed",
    `Your appointment with Dr. ${appointment.doctor?.user?.firstName || "Doctor"} for ${formatAppointmentDate(appointment.appointmentDateTime)} has been confirmed!`,
    NotificationType.APPOINTMENT,
    { appointmentId: appointment.id }
  );

  // 2. Auto-notify Assigned Doctor
  await notificationServices.notifyUser(
    appointment.doctor?.user?.id,
    "New Confirmed Appointment",
    `You have a confirmed appointment with Patient ${appointment.patient?.user?.firstName || "Patient"} for ${formatAppointmentDate(appointment.appointmentDateTime)}.`,
    NotificationType.APPOINTMENT,
    { appointmentId: appointment.id, patientId: appointment.patient?.id }
  );

  // auto send the notification when the  patient  confirm the reshedule  notification
  if (user.role === Roles.PATIENT) {
    await notificationServices.notifyRole(
      Roles.RECEPTIONIST,
      "Rescheduled Appointment Confirmed",
      `Patient ${appointment.patient?.user?.firstName || "Patient"} confirmed the rescheduled appointment with Dr. ${appointment.doctor?.user?.firstName || "Doctor"} for ${new Date(appointment.appointmentDateTime).toLocaleDateString()}.`,
      NotificationType.APPOINTMENT,
      { appointmentId: appointment.id, patientId: appointment.patient?.id }
    );
  }


  return {
    id: confirmedAppointment.id,
    appointmentDateTime: confirmedAppointment.appointmentDateTime,
    appointmentType: confirmedAppointment.appointmentType,
    status: confirmedAppointment.status,
    reason: confirmedAppointment.reason,
    consultationNotes: confirmedAppointment.consultationNotes || null,
    cancellationReason: confirmedAppointment.cancellationReason || null,
    patient: {
      id: confirmedAppointment.patient?.id,
      name: confirmedAppointment.patient?.user
        ? `${confirmedAppointment.patient.user.firstName} ${confirmedAppointment.patient.user.lastName}`.trim()
        : "N/A",
      phoneNumber: confirmedAppointment.patient?.user?.phoneNumber || null,
    },
    doctor: {
      id: confirmedAppointment.doctor?.id,
      name: confirmedAppointment.doctor?.user
        ? `Dr. ${confirmedAppointment.doctor.user.firstName} ${confirmedAppointment.doctor.user.lastName}`.trim()
        : "N/A",
      specialization: confirmedAppointment.doctor?.specialization || null,
    },
    updatedAt: confirmedAppointment.updatedAt,
  };
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

  if (newDateTime <= new Date(appointment.appointmentDateTime)) {
    throw new AppError("New appointment date and time must be strictly after the current appointment date and time", 400);
  }

  // Start Transaction
  const rescheduledAppointment = await AppDataSource.transaction(async (manager) => {

    // Check Doctor Conflict
    const existingDoctorAppointment = await appointmentRepository.findDoctorAppointment(manager, appointment.doctor.id, newDateTime);
    if (existingDoctorAppointment && existingDoctorAppointment.id !== appointment.id &&
      [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED].includes(existingDoctorAppointment.status)
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
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.RESCHEDULED
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
      status: AppointmentStatus.RESCHEDULED,
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
  });

  // 🔔 Auto-notify Patient AFTER transaction finishes
  await notificationServices.notifyUser(
    appointment.patient?.user?.id,
    "Appointment Rescheduled 📅",
    `Your appointment with Dr. ${appointment.doctor?.user?.firstName || "Doctor"} has been rescheduled to ${newDateTime.toLocaleDateString()}. Please review and confirm your new schedule.`,
    NotificationType.APPOINTMENT,
    { appointmentId: appointment.id }
  );

  return rescheduledAppointment;
};

//: Get My Appointments (Patient Self-Service With APIFeatures Query Parameters)
module.exports.getMyAppointments = async (userId, queryString = {}) => {
  const patient = await patientRepository.findPatientByUserId(userId);
  if (!patient) throw new AppError("patient profile was not found!", 404);

  const result = await appointmentRepository.getAppointmentByPatientId(patient.id, queryString);

  // format data for patient view
  result.items = (result.items || []).map((apt) => ({
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

  return result;
};



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

  const updatedAppointment = await AppDataSource.transaction(
    async (manager) => {
      const updated = await appointmentRepository.updateAppointmentWithTransaction(
        manager,
        appointmentId,
        appointmentInfo
      );

      // Auto-generate billing invoice inside the SAME transaction!
      await billingServices.generateBillingForAppointment(appointmentId, manager);

      return updated;
    }
  );

  //Auto-create notification for Patient AFTER transaction finishes
  await notificationServices.notifyUser(
    appointment.patient?.user?.id,
    "Appointment Completed 🩺",
    `Your appointment with Dr. ${appointment.doctor?.user?.firstName || "Doctor"} is now completed.`,
    NotificationType.APPOINTMENT,
    { appointmentId: appointment.id }
  );


  return updatedAppointment;
};


// Process 2-Stage Unattended Appointment  Pipeline (Run by Cron)
module.exports.processUnattendedAppointmentsEscalation = async () => {
  try {
    //  Send 3-Hour Warning Reminder to Receptionists
    const pendingForReminder = await appointmentRepository.getPendingAppointmentsForReminder(3);

    for (const apt of pendingForReminder || []) {
      // 1. Send Urgent Warning to all Receptionists
      await notificationServices.notifyRole(
        Roles.RECEPTIONIST,
        "Urgent Appointment Warning",
        `Appointment for Patient ${apt.patient?.user?.firstName || "Patient"} with Dr. ${apt.doctor?.user?.firstName || "Doctor"} has been pending for over 3 hours. Please take action immediately!`,
        NotificationType.APPOINTMENT,
        { appointmentId: apt.id, patientId: apt.patient?.id }
      );

      // 2. Mark reminderSentAt timestamp so Stage 1 doesn't repeat
      await appointmentRepository.updateReminderSentAt(apt.id);
    }

    //  Auto-Cancel 4-Hour Unattended Pending Appointments
    const pendingForCancellation = await appointmentRepository.getPendingAppointmentsForCancellation(4);

    for (const apt of pendingForCancellation || []) {
      // 1. Auto-Cancel appointment status in DB
      await appointmentRepository.updateAppointmentWithTransaction(
        AppDataSource.manager,
        apt.id,
        {
          status: AppointmentStatus.CANCELLED,
          cancellationReason: "Auto-cancelled by system: Unconfirmed by front desk within 4 hours.",
        }
      );

      // 2. Send Cancellation Notification to Patient
      await notificationServices.notifyUser(
        apt.patient?.user?.id,
        "Appointment Request Cancelled ",
        `Your appointment request for Dr. ${apt.doctor?.user?.firstName || "Doctor"} was auto-cancelled because it could not be confirmed in time. Please select another slot.`,
        NotificationType.APPOINTMENT,
        { appointmentId: apt.id }
      );
    }
  } catch (error) {
    console.error("Error processing appointment escalation pipeline:", error.message);
  }
};

// Add or Update Consultation Notes (Doctor / Admin)
module.exports.addConsultationNotes = async (appointmentId, consultationNotes, user) => {
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment not found", 404);

  // If Doctor role, verify doctor is assigned to this appointment
  if (user.role === Roles.DOCTOR) {
    const doctor = await doctorRepository.findDoctorByUserId(user.id);
    if (!doctor || appointment.doctor?.id !== doctor.id) {
      throw new AppError("You do not have permission to add consultation notes for this appointment", 403);
    }
  }

  const appointmentInfo = {
    consultationNotes: consultationNotes.trim(),
    updatedBy: {
      id: user.id,
    },
  };

  //update the appointments  
  const updatedAppointment = await AppDataSource.transaction(async (manager) => {
    return await appointmentRepository.updateAppointmentWithTransaction(manager, appointmentId, appointmentInfo);
  });

  return updatedAppointment;
};

// Get Doctor Details linked to an Appointment
module.exports.getDoctorByAppointmentId = async (appointmentId) => {
  const appointment = await appointmentRepository.getAppointmentById(appointmentId);
  if (!appointment) throw new AppError("Appointment not found", 404);

  if (!appointment.doctor) throw new AppError("Doctor profile not found for this appointment", 404);

  const doc = appointment.doctor;
  return {
    id: doc.id,
    name: doc.user ? `Dr. ${doc.user.firstName} ${doc.user.lastName}`.trim() : "N/A",
    email: doc.user?.email || null,
    phoneNumber: doc.user?.phoneNumber || null,
    specialization: doc.specialization || null,
    qualification: doc.qualification || null,
    experienceYears: doc.experienceYears || null,
    consultationFee: doc.consultationFee || null,
    availabilityStatus: doc.availabilityStatus || null,
    department: doc.department ? doc.department.departmentName : null,
  };
};

