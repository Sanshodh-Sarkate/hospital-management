const asyncHandler = require('../../common/utils/async-handler');
const medicalReportService = require("./medical-report.services");
const { sendSuccess } = require('../../common/utils/response.util');
const logger = require('pino')()

// Create Medical Report
module.exports.createMedicalReport = asyncHandler(async (req, res, next) => {
    const medicalReport = await medicalReportService.createMedicalReport(req.body, req.user);
    return sendSuccess(res, 201, "Medical report created successfully", { medicalReport });
});

// Get All Medical Reports (Role-Aware)
module.exports.getAllMedicalReports = asyncHandler(async (req, res, next) => {
    const medicalReports = await medicalReportService.getAllMedicalReports(req.user);
    return sendSuccess(
        res,
        200,
        "Medical reports retrieved successfully",
        {
            medicalReports,
            results: medicalReports.length,
        }
    );
});

// Get Medical Report By ID
module.exports.getMedicalReportById = asyncHandler(async (req, res, next) => {
    const medicalReport = await medicalReportService.getMedicalReportById(req.params.id);
    return sendSuccess(res, 200, "Medical report retrieved successfully", { medicalReport });
});

// Get My Medical Reports (Role-Aware Self-Service)
module.exports.getMyMedicalReports = asyncHandler(async (req, res, next) => {
    console.log('heloo');

    logger.info("hello")
    const medicalReports = await medicalReportService.getMyMedicalReports(req.user);
    return sendSuccess(res, 200, "Medical reports retrieved successfully", { medicalReports, results: medicalReports.length });
});

// Get Medical Reports By Appointment ID
module.exports.getAllMedicalReportByAppointmentId = asyncHandler(async (req, res, next) => {
    const medicalReports = await medicalReportService.getMedicalReportsByAppointmentId(req.params.appointmentId || req.params.id);
    return sendSuccess(res, 200, "Medical reports retrieved successfully", { medicalReports, results: medicalReports.length });
});

// Update Medical Report
module.exports.updateMedicalReport = asyncHandler(async (req, res, next) => {
    const medicalReport = await medicalReportService.updateMedicalReport(
        req.params.id,
        req.body,
        req.user.id
    );

    return sendSuccess(
        res,
        200,
        "Medical report updated successfully",
        { medicalReport }
    );
});

// Delete Medical Report
module.exports.deleteMedicalReport = asyncHandler(async (req, res, next) => {
    await medicalReportService.deleteMedicalReport(
        req.params.id,
        req.user
    );
    return sendSuccess(
        res,
        200,
        "Medical report deleted successfully"
    );
});

// Download Medical Report PDF
module.exports.downloadMedicalReportPdf = asyncHandler(async (req, res, next) => {
    const { filePath, fileName } = await medicalReportService.getMedicalReportPdfPath(
        req.params.id,
        req.user
    );

    return res.download(filePath, fileName, (err) => {
        if (err && !res.headersSent) {
            return next(new AppError("Could not download medical report PDF", 500));
        }
    });
});
