const express =  require('express');
const authRoute = require('./modules/auth/auth.routes')
const errorMiddleware = require('./common/middleware/error.middleware');
const  departmentRoutes  = require('./modules/department/department.routes');
const  doctorRoutes =  require('./modules/doctor/doctor.routes')
const  patientRoutes =  require('./modules/patient/patient.routes');
const receptionistRoutes =  require("./modules/receptionist/receptionist.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const prescriptionRoutes =  require('./modules/prescription/prescription.routes')

const cookieParser = require('cookie-parser');

const app  = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// app.get('/' , (req ,res) => {
//     res.send("hello patien")
// })

app.use('/api/auth' ,authRoute )
app.use('/api/department' , departmentRoutes)
app.use('/api/doctor' ,  doctorRoutes)
app.use('/api/patient'  , patientRoutes)
app.use('/api/receptionists' , receptionistRoutes)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions' , prescriptionRoutes);

app.use(errorMiddleware);

module.exports =  app 