const express =  require('express');
const authRoute = require('./modules/auth/auth.routes')
const errorMiddleware = require('./common/middleware/error.middleware');
const  departmentRoutes  = require('./modules/department/department.routes');
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

app.use(errorMiddleware);

module.exports =  app 