//
const asyncHandler = require('../../common/utils/async-handler');
const appointmentService = require("./appointment.services");
const { sendSuccess, sendPaginated } = require('../../common/utils/response.util');

module.exports.bookAppointment = module.exports.createAppointment = asyncHandler(async (req, res, next) => {
    const appointment = await appointmentService.createAppointment(req.body, req.user);
    return sendSuccess(res, 200, "Appointment created successFully", { appointment });
});

//: Get All Appointments (Supports APIFeatures query parameters)
module.exports.getAllAppointments = asyncHandler(async (req, res, next) => {
    const appointments = await appointmentService.getAllAppointments(req.query);
    return sendPaginated(res, 200, "Appointment fetch successFully", appointments);
});


module.exports.getAppointmentById = asyncHandler(async (req, res, next) => {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    return sendSuccess(res, 200, "Appointment fetch successFully", { appointment });
});

module.exports.updateAppointment = asyncHandler(async (req, res, next) => {
    const updatedAppointment = await appointmentService.updateAppointment(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, "Appointment update successFully", { updatedAppointment });
});

module.exports.deleteAppointment = asyncHandler(async (req, res, next) => {
    const appointment = await appointmentService.deleteAppointment(req.params.id, req.user);
    sendSuccess(res, 200, "Appointment deleted successFully", { appointment })
})

module.exports.confirmAppointment = asyncHandler(async (req, res, next) => {
    const confirmedAppointment = await appointmentService.confirmAppointment(req.params.id, req.user)
    sendSuccess(res, 200, "Appointment confirmed successfully", { confirmedAppointment });
})

// appoinment only reject  by the recepationist and doctor   
module.exports.rejectAppointment = asyncHandler(async (req, res, next) => {
    const rejectedAppointment = await appointmentService.rejectAppointment(req.params.id, req.user, req.body.rejectionReason);
    sendSuccess(res, 200, "Appointment rejected successfully", { rejectedAppointment })
})


//appointment cancle only Patient
module.exports.cancelAppointment = asyncHandler(async (req, res, next) => {
    const cancledAppointment = await appointmentService.cancleAppointment(req.params.id, req.user, req.body.cancellationReason)
    sendSuccess(res, 200, "Appointment cancelled successfully", { cancledAppointment });
})
module.exports.rescheduleAppointment = asyncHandler(async (req, res, next) => {
    const appointment =
        await appointmentService.rescheduleAppointment(
            req.params.id,
            req.body.appointmentDateTime,
            req.user
        );
    sendSuccess(res, 200, "Appointment rescheduled successfully", { appointment })

})

//: Get My Appointments (Supports APIFeatures query parameters)
module.exports.getMyAppointments = asyncHandler(async (req, res, next) => {
    const appointments = await appointmentService.getMyAppointments(req.user.id, req.query);
    return sendPaginated(
        res,
        200,
        "Your appointments fetched successfully",
        { appointments },
        { results: appointments.length }
    );
})


module.exports.completeAppointment = asyncHandler(async (req, res, next) => {
    const complatedAppointment = await appointmentService.completeAppointment(req.params.id, req.user)
    sendSuccess(res, 200, "Appointment completed successfully", { complatedAppointment });
})