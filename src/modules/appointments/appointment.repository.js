const Module = require("node:module");
const AppDataSource = require("../../config/db");
const Appointment = require("./appointment.entity")

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


module.exports ={
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    findDoctorAppointment,
    findPatientAppointment,
    updateAppointmentWithTransaction,
    getAppointmentByPatientId
}