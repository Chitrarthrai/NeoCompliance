const express = require("express");
const router = express.Router();
const {
  getQuestionsByRoleAndSection,
  getSectionsByUserRole,
  getUserSectionScores,
  submitSectionScore,
} = require("../controllers/user-controller");
const { auth, authRole } = require("../middlewares/auth-middleware");

router.post(
  "/questions",
  auth,
  authRole(["associate"]),
  getQuestionsByRoleAndSection
);
router.post(
  "/sections-by-user",
  auth,
  authRole(["associate"]),
  getSectionsByUserRole
);
router.post(
  "/scores-by-section",
  auth,
  authRole(["associate"]),
  getUserSectionScores
);
router.post(
  "/submit-section-score",
  auth,
  authRole(["associate"]),
  submitSectionScore
);

module.exports = router;
