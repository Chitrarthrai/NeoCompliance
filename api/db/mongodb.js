const logger = require("../utils/logger");
const mongoose = require("mongoose");

let isConnected = false;

async function connectToDB() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      tls: true,
      retryWrites: true,
    });

    isConnected = db.connections[0].readyState === 1;
    logger.info("MongoDB connected successfully!");
    return db;
  } catch (error) {
    logger.info("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = { connectToDB };
