const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth-route");
const associateRoutes = require("./associate-route");
const directRoutes = require("./direct-route");
const managerRoutes = require("./manager-route");
const inspectorRoutes = require("./inspector-route");

// Register routes
router.use("/auth", authRoutes);
router.use("/associates", associateRoutes);
router.use("/direct", directRoutes);
router.use("/manager", managerRoutes);
router.use("/inspectors", inspectorRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running for neo compliance" });
});

// Add more routes as your API grows
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// etc.

module.exports = router;
