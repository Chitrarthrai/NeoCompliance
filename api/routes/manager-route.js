const express = require("express");
const router = express.Router();
const {
  getQuestionsByRoleAndSection,
  getSectionsByUserRole,
  getUserSectionScores,
  submitSectionScore,
  getAssociatesScoresForManager,
} = require("../controllers/user-controller");
const { createAssociate } = require("../controllers/auth-controller");
const { auth, authRole } = require("../middlewares/auth-middleware");

router.post(
  "/questions",
  auth,
  authRole(["manager"]),
  getQuestionsByRoleAndSection
);
router.post(
  "/sections-by-user",
  auth,
  authRole(["manager"]),
  getSectionsByUserRole
);
router.post(
  "/scores-by-section",
  auth,
  authRole(["manager"]),
  getUserSectionScores
);
router.post(
  "/submit-section-score",
  auth,
  authRole(["manager"]),
  submitSectionScore
);
router.post(
  "/associate-scores",
  auth,
  authRole(["manager"]),
  getAssociatesScoresForManager
);
router.post("/create-associate", auth, authRole(["manager"]), createAssociate);

module.exports = router;
