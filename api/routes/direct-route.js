const express = require("express");
const router = express.Router();
const {
  uploadQuestion,
  getScoreDetails,
  assignStoresToUser,
} = require("../controllers/user-controller");
const { createUser } = require("../controllers/auth-controller");
const { createInspector } = require("../controllers/auth-controller");
const { auth, authRole } = require("../middlewares/auth-middleware");

router.post("/upload-question", auth, authRole(["direct"]), uploadQuestion);
router.post("/register", auth, authRole(["direct"]), createUser);
router.post("/score-details", auth, authRole(["direct"]), getScoreDetails);
router.post("/assign-stores", auth, authRole(["direct"]), assignStoresToUser);
router.post("/create-inspector", auth, authRole(["direct"]), createInspector);

module.exports = router;
