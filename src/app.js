const express = require('express');
const path = require("path")
const authRoute = require('./modules/auth/auth.routes')
const errorMiddleware = require('./common/middleware/error.middleware');
const departmentRoutes = require('./modules/department/department.routes');
const adminRoutes = require("./modules/admin/admin.routes");

const doctorRoutes = require('./modules/doctor/doctor.routes')
const patientRoutes = require('./modules/patient/patient.routes');
const receptionistRoutes = require("./modules/receptionist/receptionist.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const prescriptionRoutes = require('./modules/prescription/prescription.routes')
const medicalReportRoutes = require('./modules/medical-report/medical-report.routes')
const billingRoutes = require("./modules/billing/billing-routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const notificationRoutes = require("./modules/notification/notification.routes");
const hospitalRoutes = require("./modules/hospital/hospital.routes");




const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// 100 requests per 15 minutes window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
    errors: null,
  },
});

// Apply rate limiter to all /api endpoints
app.use('/api', limiter);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

app.use(express.json());

// app.get('/' , (req ,res) => {
//     res.send("hello patien")
// })


app.use('/api/auth', authRoute)
app.use('/api/admin', adminRoutes);
app.use('/api/department', departmentRoutes)
app.use('/api/doctor', doctorRoutes)
app.use('/api/patient', patientRoutes)
app.use('/api/receptionists', receptionistRoutes)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medical-reports', medicalReportRoutes)
app.use("/api/billing", billingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/hospital", hospitalRoutes);





app.use(errorMiddleware);

module.exports = app 