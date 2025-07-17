require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnection = require('./configs/db-config');
const authRoute = require('./routes/auth-route');
// const adminRoute = require('./routes/admin-route');
// const employeeRoute = require('./routes/employee-route');
// const leaderRoute = require('./routes/leader-route');
const directRoute = require('./routes/direct-route');
// const internRoute = require('./routes/intern-route')
// const temporaryRoute = require('./routes/temporary-routes')
// const errorMiddleware = require('./middlewares/error-middleware');
// const ErrorHandler = require('./utils/error-handler');
// const { auth, authRole } = require('./middlewares/auth-middleware');
// const queryRoutes= require('./routes/queryRoutes')

// Import the config file where cron is scheduled
// const scheduledCronJobs = require('./configs/cron-config');  // Ensure the cron job runs

const app = express();
const PORT = process.env.PORT || 5500;
const { CLIENT_URL } = process.env;

console.log(`Client URL: ${CLIENT_URL}`);

// Database Connection
dbConnection();

// CORS Options
const corsOption = {
    credentials: true,
    // origin: ['http://localhost:3000', 'http://1.1.1.111:3000', CLIENT_URL]
    // origin:"*"
    origin: function (origin, callback) {
        callback(null, true);
    }
};

// Middleware Configuration
app.use(cors(corsOption));
// app.use(cors({ allowedHeaders: ['Content-Type', 'mac-address'] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute);
// app.use('/api/admin', auth, authRole(['admin']), adminRoute);
// app.use('/api/employee', auth, authRole(['employee', 'leader']), employeeRoute);
app.use('/api/direct', directRoute);


// Not Found Middleware
app.use((req, res, next) => {
    return next(ErrorHandler.notFound('The Requested Resource Not Found'));
});

// // Error Middleware
// app.use(errorMiddleware);



// Start Server
app.listen(PORT, () => console.log(`🚀 Server Running on Port: ${PORT}`));
