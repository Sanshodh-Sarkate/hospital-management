const Module = require("node:module");
const AppDataSource = require("../../config/db");
const Appointment = require("./appointment.entity")
const { LessThanOrEqual, IsNull, Not } = require("typeorm");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const appointmentStatusEnum = require("../../common/enums/appointment-status.enum");
const appointmentRepository = AppDataSource.getRepository(Appointment);


//create appointment  (transaction)
const createAppointment = async (manager, appointmentData) => {
    const repository = await manager.getRepository(Appointment)
    const appointment = repository.create(appointmentData);
    return await repository.save(appointment);
}

//gett all Appointments  
const getAllAppointments = async () => {
    return await appointmentRepository.find({
        relations: {
            patient: true,
            doctor: true,
            receptionist: true,

        },
        order: {
            appointmentDateTime: "DESC",
        },
    });
}



//get AppointmentBy appointmentId  
const getAppointmentById = async (appointmentId) => {
    return await appointmentRepository.findOne({
        where: {
            id: appointmentId,
        },
        relations: {
            patient: {
                user: true,
            },
            doctor: {
                user: true,
            },
            receptionist: true,
            createdBy: true,
            updatedBy: true,
            prescription: true,
            billing: true,
        },
    });
}

// FIND THE DOCTOR APPOINTMENT inside transaction
const findDoctorAppointment = async (manager, doctorId, appointmentDateTime) => {
    const repository = manager.getRepository(Appointment);
    return await repository.findOne({
        where: {
            doctor: {
                id: doctorId
            },
            appointmentDateTime: new Date(appointmentDateTime),
        }
    })
}

// FIND THE PATIENT APPOINTMENT inside transaction
const findPatientAppointment = async (manager, patientId, appointmentDateTime) => {
    const repository = manager.getRepository(Appointment);
    return await repository.findOne({
        where: {
            patient: {
                id: patientId
            },
            appointmentDateTime: new Date(appointmentDateTime),
        }
    })
}

// update AppointmentDatq c 
const updateAppointmentWithTransaction = async (manager, appointmentId, appointmentData) => {
    const repository = manager.getRepository(Appointment);
    await repository.update(appointmentId, appointmentData);
    return await repository.findOne({
        where: {
            id: appointmentId
        },
        relations: {
            patient: true,
            doctor: true,
            receptionist: true,
            createdBy: true,
            updatedBy: true,
        },
    })
}


const  getAppointmentByPatientId  =   async(patientId) => {
    return await  appointmentRepository.find({
        where : {
            patient: {
                id : patientId,
            }
        },
        relations: {
            doctor:  {
                user: true  ,
                department : true  
            }
        },
         order: {
            appointmentDateTime: "DESC",
        },
    });
}

//  Get Pending Appointments needing 3-hour reminder (reminderSentAt IS NULL)
const getPendingAppointmentsForReminder =  async(hours = 3) => {
    const thresholdDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await appointmentRepository.find({
        where: {
            status: appointmentStatusEnum.PENDING,
            createdAt: LessThanOrEqual(thresholdDate),
            reminderSentAt: IsNull()
        },
        relations: {
         patient: { user: true },
         doctor: { user: true },
    },
    })
}

// Get Pending Appointments needing 4-hour cancellation (reminderSentAt IS NOT NULL)
const getPendingAppointmentsForCancellation = async (hours = 4) => {
  const thresholdDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  return await appointmentRepository.find({
    where: {
      status: AppointmentStatus.PENDING,
      createdAt: LessThanOrEqual(thresholdDate),
      reminderSentAt: Not(IsNull()),
    },
    relations: {
      patient: { user: true },
      doctor: { user: true },
    },
  });
};

//  Mark reminderSentAt timestamp
const updateReminderSentAt = async (appointmentId) => {
  await appointmentRepository.update(appointmentId, {
    reminderSentAt: new Date(),
  });
};


module.exports ={
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    findDoctorAppointment,
    findPatientAppointment,
    updateAppointmentWithTransaction,
    getAppointmentByPatientId,
    updateReminderSentAt,
    getPendingAppointmentsForCancellation,
    getPendingAppointmentsForReminder
}