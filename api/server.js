require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnection = require("./configs/db-config");
const indexRoutes = require("./routes/index");
const ErrorHandler = require("./utils/error-handler");
const errorMiddleware = require("./middlewares/error-middleware");
const { auth, authRole } = require("./middlewares/auth-middleware");

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
  },
};

app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", indexRoutes);

// Not Found Middleware
app.use((req, res, next) => {
  return next(ErrorHandler.notFound("The Requested Resource Not Found"));
});

// Error Middleware
app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server Running on Port: ${PORT}`));
