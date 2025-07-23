const { app } = require("@azure/functions");
const express = require("express");
const { connectToDB } = require("../db/mongodb");
const apiRoutes = require("../routes");
const logger = require("../utils/logger");

// Create Express app
const expressApp = express();

// Custom simple body parser that avoids using raw-body
const customBodyParser = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    next();
    return;
  }

  // We already parsed the body in the Azure Functions handler
  // Just pass through and don't try to parse again
  next();
};

// Middleware - use custom body parser instead of express.json()
expressApp.use(customBodyParser);

// Connect to MongoDB when the app starts
let dbConnected = false;
const initDB = async () => {
  if (!dbConnected) {
    await connectToDB();
    dbConnected = true;
    logger.info("MongoDB connected");
  }
};

// Register API routes
expressApp.use("/api", apiRoutes);

// Error handling middleware
expressApp.use((err, req, res, next) => {
  logger.error("Express error handler:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Azure Function HTTP trigger
app.http("api", {
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  authLevel: "anonymous",
  route: "{*path}", // This will catch all routes
  handler: async (request, context) => {
    try {
      // Set the Azure context for logging
      logger.setContext(context);

      // Initialize DB connection
      await initDB();
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`);
      return {
        status: 500,
        body: JSON.stringify({
          error: "Database connection failed",
          details: error.message,
        }),
      };
    }

    // Parse the request body directly
    let bodyContent = {};

    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const rawText = await request.text();
          logger.info("Raw request body:", rawText);
          try {
            bodyContent = JSON.parse(rawText);
          } catch (e) {
            logger.error(`Failed to parse JSON: ${e.message}`);
          }
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          try {
            // Manually parse form data
            const rawText = await request.text();
            const params = new URLSearchParams(rawText);
            for (const [key, value] of params.entries()) {
              bodyContent[key] = value;
            }
          } catch (e) {
            logger.error(`Failed to parse form data: ${e.message}`);
          }
        } else {
          // Default to text for other content types
          const text = await request.text();
          bodyContent = { rawText: text };
        }
      } catch (e) {
        logger.error(`Error parsing body: ${e.message}`);
      }
    }

    // Create Express request and response objects
    const expressReq = {
      method: request.method,
      url: request.url,
      originalUrl: request.url,
      path: request.params.path,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.query.entries()),
      params: request.params,
      body: bodyContent,
    };

    // Create a promise to handle the Express response
    return new Promise((resolve) => {
      const expressRes = {
        statusCode: 200,
        headers: {},
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        set(key, value) {
          this.headers[key] = value;
          return this;
        },
        setHeader(key, value) {
          this.headers[key] = value;
          return this;
        },
        get(key) {
          return this.headers[key];
        },
        getHeader(key) {
          return this.headers[key];
        },
        removeHeader(key) {
          delete this.headers[key];
          return this;
        },
        type(type) {
          this.headers["Content-Type"] = type;
          return this;
        },
        json(data) {
          this.body = JSON.stringify(data);
          this.headers["Content-Type"] = "application/json";
          resolve({
            status: this.statusCode,
            headers: this.headers,
            body: this.body,
          });
        },
        send(data) {
          if (typeof data === "object") {
            this.body = JSON.stringify(data);
            this.headers["Content-Type"] = "application/json";
          } else {
            this.body = data;
          }
          resolve({
            status: this.statusCode,
            headers: this.headers,
            body: this.body,
          });
        },
        end() {
          resolve({
            status: this.statusCode,
            headers: this.headers,
            body: this.body || "",
          });
        },
      };

      // Log the incoming request
      logger.info(
        `Processing ${expressReq.method} request to ${expressReq.url}`
      );
      logger.info("Request body:", JSON.stringify(expressReq.body));

      // Handle the request with Express
      expressApp(expressReq, expressRes, (error) => {
        if (error) {
          logger.error(`Express error: ${error.message}`);
          resolve({
            status: 500,
            body: JSON.stringify({
              error: "Internal Server Error",
              message: error.message,
            }),
          });
        } else {
          // If Express doesn't handle the route
          resolve({
            status: 404,
            body: JSON.stringify({
              error: "Not Found",
              message: "The requested resource was not found",
            }),
          });
        }
      });
    });
  },
});
