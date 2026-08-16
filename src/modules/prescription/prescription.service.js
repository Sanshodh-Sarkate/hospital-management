const AppDataSource = require("../../config/db");

const prescriptionRepository = require("./prescription.repository");
const appointmentRepository = require("../appointments/appointment.repository");
const doctorRepository = require("../doctor/doctor.repository");
const patientRepository = require("../patient/patient.repository");

const AppError = require("../../common/errors/app.error");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");

const filterObject = require("../../common/utils/filter-object.util");
const Roles = require("../../common/enums/role.enum");

// Helper DTO formatters
const formatPrescriptionForPatient = (p) => {
    if (!p) return null;
    return {
        id: p.id,
        diagnosis: p.diagnosis,
        symptoms: p.symptoms || null,
        advice: p.advice || null,
        followUpDate: p.followUpDate || null,
        createdAt: p.createdAt,
        doctor: {
            id: p.doctor?.id,
            name: p.doctor?.user ? `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`.trim() : "N/A",
            specialization: p.doctor?.specialization || null,
        },
        appointment: {
            id: p.appointment?.id,
            appointmentDateTime: p.appointment?.appointmentDateTime || null,
        },
        medications: (p.prescriptionMedications || []).map((m) => ({
            id: m.id,
            medicineName: m.medicineName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            quantity: m.quantity,
            specialInstructions: m.specialInstructions || null,
        })),
    };
};

const formatPrescriptionForStaff = (p) => {
    if (!p) return null;
    return {
        id: p.id,
        diagnosis: p.diagnosis,
        symptoms: p.symptoms || null,
        advice: p.advice || null,
        followUpDate: p.followUpDate || null,
        createdAt: p.createdAt,
        patient: {
            id: p.patient?.id,
            name: p.patient?.user ? `${p.patient.user.firstName} ${p.patient.user.lastName}`.trim() : "N/A",
            gender: p.patient?.gender || null,
            dateOfBirth: p.patient?.dateOfBirth || null,
            phoneNumber: p.patient?.user?.phoneNumber || p.patient?.emergencyContactNumber || null,
        },
        doctor: {
            id: p.doctor?.id,
            name: p.doctor?.user ? `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`.trim() : "N/A",
            specialization: p.doctor?.specialization || null,
        },
        appointment: {
            id: p.appointment?.id,
            appointmentDateTime: p.appointment?.appointmentDateTime || null,
        },
        medications: (p.prescriptionMedications || []).map((m) => ({
            id: m.id,
            medicineName: m.medicineName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            quantity: m.quantity,
            specialInstructions: m.specialInstructions || null,
        })),
    };
};

//this is for the createPrescription 
module.exports.createPrescription = async (prescriptionData, user) => {
    // 1. Validate authenticated user
    const doctor = await doctorRepository.findDoctorByUserId(user.id);
    if (!doctor) {
        throw new AppError("Doctor profile not found", 404);
    }

    const appointment = await appointmentRepository.getAppointmentById(
        prescriptionData.appointmentId
    );
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }

    // Make sure appointment belongs to this doctor
    if (appointment.doctor.id !== doctor.id) {
        throw new AppError("You are not authorized to create a prescription for this appointment", 403);
    }

    // Appointment must be CONFIRMED or COMPLETED
    if (![AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED].includes(appointment.status)) {
        throw new AppError(
            "Prescription can only be created for a CONFIRMED or COMPLETED appointment",
            400
        );
    }

    // Check whether prescription already exists for this appointment
    const existingPrescription = await prescriptionRepository.getPrescriptionByAppointmentId(appointment.id);
    if (existingPrescription) {
        throw new AppError(
            "A prescription already exists for this appointment",
            409
        );
    }

    return await AppDataSource.transaction(async (manager) => {
        // Prepare prescription data
        const prescriptionInfo = filterObject(
            prescriptionData,
            "diagnosis",
            "symptoms",
            "advice",
            "followUpDate"
        );

        prescriptionInfo.appointment = appointment;
        prescriptionInfo.doctor = doctor;
        prescriptionInfo.patient = appointment.patient;
        prescriptionInfo.createdBy = { id: user.id };
        prescriptionInfo.updatedBy = { id: user.id };
 
        const prescription = await prescriptionRepository.createPrescription(manager, prescriptionInfo);

        // Prepare medicationData   
        if (prescriptionData.medications && prescriptionData.medications.length > 0) {
            for (const medicationData of prescriptionData.medications) {
                const medicationInfo = filterObject(
                    medicationData,
                    "medicineName",
                    "dosage",
                    "frequency",
                    "duration",
                    "quantity",
                    "specialInstructions"
                );

                medicationInfo.prescription = prescription;

                await prescriptionRepository.createPrescriptionMedication(
                    manager,
                    medicationInfo
                );
            }
        }

        // Return clean, formatted prescription DTO from DB inside transaction
        const savedPrescription = await prescriptionRepository.getPrescriptionById(prescription.id, manager);
        return formatPrescriptionForStaff(savedPrescription);
    });
};


// CHANGED: Get All Prescriptions (Supports APIFeatures query parameters)
module.exports.getPrescriptions = async (user, queryString = {}) => {
    let result;

    if (user.role === Roles.ADMIN || user.role === Roles.RECEPTIONIST) {
        result = await prescriptionRepository.getAllPrescriptions(queryString);
    } else if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile not found", 404);
        }
        result = await prescriptionRepository.getPrescriptionsByDoctorId(doctor.id, queryString);
    } else {
        throw new AppError("You are not authorized to view prescriptions", 403);
    }

    result.items = (result.items || []).map(formatPrescriptionForStaff);
    return result;
};



// get prescription based on the role   
module.exports.getPrescription = async (user) => {
    let prescriptions = [];

    if (user.role === Roles.ADMIN || user.role === Roles.RECEPTIONIST) {
        prescriptions = await prescriptionRepository.getAllPrescriptions();
    } else if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile not found", 404);
        }
        prescriptions = await prescriptionRepository.getPrescriptionsByDoctorId(doctor.id);
    } else {
        throw new AppError("You are not authorized to view prescriptions", 403);
    }

    return prescriptions.map(formatPrescriptionForStaff);
};


// find the specific prescriptionById base on roles  
module.exports.getPrescriptionById = async (
    prescriptionId,
    user
) => {
    // Find prescription
    const prescription = await prescriptionRepository.getPrescriptionById(
        prescriptionId
    );

    if (!prescription) {
        throw new AppError("Prescription not found", 404);
    }

    // Admin can access any prescription
    if (user.role === Roles.ADMIN || user.role === Roles.RECEPTIONIST) {
        return formatPrescriptionForStaff(prescription);
    }

    // Doctor can access their own prescriptions
    if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile not found", 404);
        }

        if (prescription.doctor?.id !== doctor.id) {
            throw new AppError("You are not authorized to access this prescription", 403);
        }

        return formatPrescriptionForStaff(prescription);
    }

    // Patient can access only their own prescription
    if (user.role === Roles.PATIENT) {
        const patient = await patientRepository.findPatientByUserId(user.id);
        if (!patient) {
            throw new AppError("Patient profile not found", 404);
        }

        if (prescription.patient?.id !== patient.id) {
            throw new AppError("You are not authorized to access this prescription", 403);
        }

        return formatPrescriptionForPatient(prescription);
    }

    throw new AppError("You are not authorized to access this prescription", 403);
};


module.exports.updatePrescription = async (
    prescriptionId,
    prescriptionData,
    user
) => {
    // Validate authenticated Doctor
    const doctor = await doctorRepository.findDoctorByUserId(user.id);
    if (!doctor) {
        throw new AppError("Doctor profile not found", 404);
    }

    // Find Prescription
    const prescription = await prescriptionRepository.getPrescriptionById(prescriptionId);
    if (!prescription) {
        throw new AppError("Prescription not found", 404);
    }

    // Check prescription ownership
    if (prescription.doctor?.id !== doctor.id) {
        throw new AppError("You are not authorized to update this prescription", 403);
    }

    // Prepare allowed fields
    const updateData = filterObject(
        prescriptionData,
        "diagnosis",
        "symptoms",
        "advice",
        "followUpDate"
    );

    if (Object.keys(updateData).length === 0) {
        throw new AppError("No valid fields provided for update", 400);
    }

    updateData.updatedBy = {
        id: user.id,
    };

    const updatedPrescription = await prescriptionRepository.updatePrescription(
        AppDataSource.manager,
        prescriptionId,
        updateData
    );

    return formatPrescriptionForStaff(updatedPrescription);
};


// CHANGED: Get My Prescriptions (Patient Self-Service With APIFeatures)
module.exports.getMyPrescriptions = async (userId, queryString = {}) => {
    // Find Patient using authenticated User ID
    const patient = await patientRepository.findPatientByUserId(userId);

    if (!patient) {
        throw new AppError("Patient profile not found", 404);
    }

    // Get prescriptions belonging to the Patient
    const result = await prescriptionRepository.getPrescriptionsByPatientId(patient.id, queryString);
    result.items = (result.items || []).map(formatPrescriptionForPatient);
    return result;
};



module.exports.deletePrescription = async (
    prescriptionId,
    user
) => {

    //  Find prescription
    const prescription =
        await prescriptionRepository.getPrescriptionById(
            prescriptionId
        );

    if (!prescription) {
        throw new AppError(
            "Prescription not found",
            404
        );
    }


    // Admin can delete any prescription
    if (user.role === Roles.ADMIN) {
        return await prescriptionRepository.deletePrescription(
            AppDataSource.manager,
            prescriptionId
        );
    }


    //  Doctor can delete only their own prescription
    if (user.role === Roles.DOCTOR) {

        const doctor =
            await doctorRepository.findDoctorByUserId(
                user.id
            );

        if (!doctor) {
            throw new AppError(
                "Doctor profile not found",
                404
            );
        }

        if (prescription.doctor.id !== doctor.id) {
            throw new AppError(
                "You are not authorized to delete this prescription",
                403
            );
        }

        return await prescriptionRepository.deletePrescription(
            AppDataSource.manager,
            prescriptionId
        );
    }


    //  Other roles are not allowed
    throw new AppError(
        "You are not authorized to delete this prescription",
        403
    );
};

// Update Medication Item
module.exports.updatePrescriptionItem = async (itemId, itemData, user) => {
    const doctor = await doctorRepository.findDoctorByUserId(user.id);
    if (!doctor) {
        throw new AppError("Doctor profile not found", 404);
    }

    const medication = await prescriptionRepository.getMedicationItemById(itemId);
    if (!medication) {
        throw new AppError("Prescription medication item not found", 404);
    }

    if (medication.prescription?.doctor?.id !== doctor.id) {
        throw new AppError("You are not authorized to update this prescription item", 403);
    }

    const updateData = filterObject(
        itemData,
        "medicineName",
        "dosage",
        "frequency",
        "duration",
        "quantity",
        "specialInstructions"
    );

    if (Object.keys(updateData).length === 0) {
        throw new AppError("No valid fields provided for update", 400);
    }

    return await prescriptionRepository.updateMedicationItem(null, itemId, updateData);
};

// Delete Medication Item
module.exports.deletePrescriptionItem = async (itemId, user) => {
    const medication = await prescriptionRepository.getMedicationItemById(itemId);
    if (!medication) {
        throw new AppError("Prescription medication item not found", 404);
    }

    if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile not found", 404);
        }

        if (medication.prescription?.doctor?.id !== doctor.id) {
            throw new AppError("You are not authorized to delete this prescription item", 403);
        }
    } else if (user.role !== Roles.ADMIN) {
        throw new AppError("You do not have permission to delete this prescription item", 403);
    }

    return await prescriptionRepository.deleteMedicationItem(null, itemId);
};


