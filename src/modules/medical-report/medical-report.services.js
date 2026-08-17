const fs = require("fs");
const path = require("path");
const AppError = require("../../common/errors/app.error");
const medicalReportRepository = require("./medical-report.repository");
const appointmentRepository = require("../appointments/appointment.repository");
const doctorRepository = require("../doctor/doctor.repository");
const patientRepository = require("../patient/patient.repository");
const filterObject = require("../../common/utils/filter-object.util");
const Roles = require("../../common/enums/role.enum");
const AppointmentStatus = require("../../common/enums/appointment-status.enum");
const generateMedicalReportPdf = require('../../common/utils/medical-report.pdf');
const logger = require('pino')();

// Generate Report Number
const generateReportNumber = () => {
    const timestamp = Date.now();
    return `REP-${timestamp}`;
};

// DTO Helper
const formatMedicalReport = (r) => {
    if (!r) return null;
    return {
        id: r.id,
        reportNumber: r.reportNumber,
        reportName: r.reportName,
        reportType: r.reportType,
        result: r.result,
        normalRange: r.normalRange || null,
        unit: r.unit || null,
        reportCharge: Number(r.reportCharge || 0),
        reportFileUrl: r.reportFileUrl || null,
        remarks: r.remarks || null,
        generatedAt: r.generatedAt,
        patient: {
            id: r.patient?.id,
            name: r.patient?.user ? `${r.patient.user.firstName} ${r.patient.user.lastName}`.trim() : "N/A",
            gender: r.patient?.gender || null,
            dateOfBirth: r.patient?.dateOfBirth || null,
            phoneNumber: r.patient?.user?.phoneNumber || r.patient?.emergencyContactNumber || null,
        },
        doctor: {
            id: r.doctor?.id,
            name: r.doctor?.user ? `Dr. ${r.doctor.user.firstName} ${r.doctor.user.lastName}`.trim() : "N/A",
            specialization: r.doctor?.specialization || null,
        },
        appointment: {
            id: r.appointment?.id,
            appointmentDateTime: r.appointment?.appointmentDateTime || null,
        },
    };
};

// Create Medical Report
module.exports.createMedicalReport = async (reportData, user) => {
    const {
        appointmentId,
        reportName,
        reportType,
        result,
        normalRange,
        unit,
        remarks,
        reportCharge,
    } = reportData;

    // 1. Validate authenticated doctor profile
    const doctor = await doctorRepository.findDoctorByUserId(user.id);
    if (!doctor) {
        throw new AppError("Doctor profile not found", 404);
    }

    // 2. Validate appointment existence
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }

    // Medical reports can ONLY be generated when appointment is CONFIRMED
    if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new AppError("Cannot create medical reports for completed appointments", 400);
    }
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
        throw new AppError("Medical reports can only be generated when the appointment is CONFIRMED", 400);
    }

    // 3. Check authorization: Appointment must belong to this doctor
    if (appointment.doctor.id !== doctor.id) {
        throw new AppError(
            "You are not authorized to create a report for this appointment",
            403
        );
    }

    // 4. Generate report number
    const reportNumber = generateReportNumber();

    // 5. Save medical report
    const medicalReport = await medicalReportRepository.createMedicalReport({
        reportNumber,
        reportName,
        reportType,
        result,
        normalRange,
        unit,
        remarks,
        reportCharge: Number(reportCharge || 0),
        appointment: { id: appointment.id },
        patient: { id: appointment.patient.id },
        doctor: { id: doctor.id },
        generatedBy: { id: user.id },
    });


    // 6. Return complete report
    const completeReport = await medicalReportRepository.getMedicalReportById(medicalReport.id);
    if (!completeReport) {
        throw new AppError(
            "Medical report could not be retrieved after creation",
            500
        );
    }

    // Generate PDF file name
    const fileName = `${completeReport.reportNumber}.pdf`;
    const uploadDir = path.join(process.cwd(), "uploads", "medical-reports");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const outputPath = path.join(uploadDir, fileName);

    // Generate PDF file
    await generateMedicalReportPdf(completeReport, outputPath);

    //   Generate URL/path stored in DB
    const reportFileUrl =
        `/uploads/medical-reports/${fileName}`;

    await medicalReportRepository.updateMedicalReport(
        medicalReport.id,
        {
            reportFileUrl,
            updatedBy: {
                id: user.id,
            },
        }
    );
    const savedReport = await medicalReportRepository.getMedicalReportById(
        medicalReport.id
    );




    return formatMedicalReport(savedReport);
};

// Get All Medical Reports (Role-Aware With APIFeatures)
module.exports.getAllMedicalReports = async (user, queryString = {}) => {
    if (user.role === Roles.ADMIN || user.role === Roles.RECEPTIONIST) {
        const result = await medicalReportRepository.getAllMedicalReports(queryString);
        result.items = (result.items || []).map(formatMedicalReport);
        return result;
    }

    if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile not found", 404);
        }
        const result = await medicalReportRepository.getMedicalReportsByDoctorId(doctor.id, queryString);
        result.items = (result.items || []).map(formatMedicalReport);
        return result;
    }

    throw new AppError("You are not authorized to view medical reports", 403);
};

// Get Medical Report By ID
module.exports.getMedicalReportById = async (reportId) => {
    const medicalReport = await medicalReportRepository.getMedicalReportById(reportId);
    if (!medicalReport) {
        throw new AppError("Medical report was not found", 404);
    }
    return formatMedicalReport(medicalReport);
};

// Get My Medical Reports (Role-Aware Self-Service With APIFeatures)
module.exports.getMyMedicalReports = async (user, queryString = {}) => {
    if (user.role === Roles.PATIENT) {
        const patient = await patientRepository.findPatientByUserId(user.id);

        if (!patient) {
            throw new AppError("Patient profile not found", 404);
        }
        const result = await medicalReportRepository.getMedicalReportsByPatientId(patient.id, queryString);
        result.items = (result.items || []).map(formatMedicalReport);
        return result;
    }

    if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile not found", 404);
        }
        const result = await medicalReportRepository.getMedicalReportsByDoctorId(doctor.id, queryString);
        result.items = (result.items || []).map(formatMedicalReport);
        return result;
    }

    if (user.role === Roles.ADMIN || user.role === Roles.RECEPTIONIST) {
        const result = await medicalReportRepository.getAllMedicalReports(queryString);
        result.items = (result.items || []).map(formatMedicalReport);
        return result;
    }

    throw new AppError("You are not authorized to access medical reports", 403);
};

// Get Medical Reports By Appointment ID (With APIFeatures)
module.exports.getMedicalReportsByAppointmentId = async (appointmentId, queryString = {}) => {
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new AppError("Appointment was not found", 404);
    }

    const result = await medicalReportRepository.getMedicalReportsByAppointmentId(appointmentId, queryString);
    result.items = (result.items || []).map(formatMedicalReport);
    return result;
};


// Get Medical Reports By Patient ID
module.exports.getMedicalReportsByPatientId = async (patientId) => {
    const patient = await patientRepository.findPatientById(patientId);
    if (!patient) {
        throw new AppError("Patient was not found", 404);
    }

    const reports = await medicalReportRepository.getMedicalReportsByPatientId(patientId);
    return reports.map(formatMedicalReport);
};

// Get Medical Reports By Doctor ID
module.exports.getMedicalReportsByDoctorId = async (doctorId) => {
    const doctor = await doctorRepository.findDoctorById(doctorId);
    if (!doctor) {
        throw new AppError("Doctor was not found", 404);
    }

    const reports = await medicalReportRepository.getMedicalReportsByDoctorId(doctorId);
    return reports.map(formatMedicalReport);
};

// Update Medical Report
module.exports.updateMedicalReport = async (reportId, reportData, userId) => {
    const medicalReport = await medicalReportRepository.getMedicalReportById(reportId);
    if (!medicalReport) {
        throw new AppError("Medical report was not found", 404);
    }

    const doctor = await doctorRepository.findDoctorByUserId(userId);
    if (!doctor) {
        throw new AppError("Doctor profile was not found", 404);
    }

    if (medicalReport.doctor.id !== doctor.id) {
        throw new AppError("You are not authorized to update this medical report", 403);
    }

    const updateData = filterObject(
        reportData,
        "reportName",
        "reportType",
        "result",
        "normalRange",
        "unit",
        "reportCharge",
        "reportFileUrl",
        "remarks"
    );


    if (Object.keys(updateData).length === 0) {
        throw new AppError("No valid fields provided for update", 400);
    }

    updateData.updatedBy = { id: userId };

    const updated = await medicalReportRepository.updateMedicalReport(reportId, updateData);
    return formatMedicalReport(updated);
};

// Delete Medical Report
module.exports.deleteMedicalReport = async (reportId, user) => {
    const medicalReport = await medicalReportRepository.getMedicalReportById(reportId);
    if (!medicalReport) {
        throw new AppError("Medical report was not found", 404);
    }

    if (user.role === Roles.ADMIN) {
        return await medicalReportRepository.deleteMedicalReport(reportId);
    }

    if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor) {
            throw new AppError("Doctor profile was not found", 404);
        }

        if (medicalReport.doctor.id !== doctor.id) {
            throw new AppError("You are not authorized to delete this medical report", 403);
        }

        return await medicalReportRepository.deleteMedicalReport(reportId);
    }

    throw new AppError("You are not authorized to delete this medical report", 403);
};

// Download / Get PDF File Path for Medical Report
module.exports.getMedicalReportPdfPath = async (reportId, user) => {
    const medicalReport = await medicalReportRepository.getMedicalReportById(reportId);
    if (!medicalReport) {
        throw new AppError("Medical report was not found", 404);
    }

    // 1. Authorization & Ownership Checks
    if (user.role === Roles.PATIENT) {
        const patient = await patientRepository.findPatientByUserId(user.id);
        if (!patient || medicalReport.patient?.id !== patient.id) {
            throw new AppError("You are not authorized to download this medical report", 403);
        }
    } else if (user.role === Roles.DOCTOR) {
        const doctor = await doctorRepository.findDoctorByUserId(user.id);
        if (!doctor || medicalReport.doctor?.id !== doctor.id) {
            throw new AppError("You are not authorized to download this medical report", 403);
        }
    } else if (user.role !== Roles.ADMIN && user.role !== Roles.RECEPTIONIST) {
        throw new AppError("You are not authorized to download this medical report", 403);
    }

    // 2. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "uploads", "medical-reports");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${medicalReport.reportNumber}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // 3. Dynamically generate PDF if not present on disk
    if (!fs.existsSync(filePath)) {
        await generateMedicalReportPdf(medicalReport, filePath);
    }

    return {
        filePath,
        fileName,
    };
};
