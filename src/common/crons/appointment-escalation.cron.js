const cron = require("node-cron");
const logger = require("pino")();
const appointmentServices = require("../../modules/appointments/appointment.services");

// Initialize 2-Stage Appointment Escalation Cron Job
const initAppointmentEscalationCron = () => {
    // Runs every 15 minutes: '*/15 * * * *'
    cron.schedule("*/15 * * * *", async () => {
        logger.info("Running 2-Stage Unattended Appointment Escalation Pipeline...");
        await appointmentServices.processUnattendedAppointmentsEscalation();
    });

    logger.info("Appointment Escalation Cron Job initialized (Runs every 15 mins)");
};

module.exports = initAppointmentEscalationCron;
