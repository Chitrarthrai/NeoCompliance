const express = require("express");
const router = express.Router();
const {
  getQuestionsByRoleAndSection,
  getSectionsByUserRole,
} = require("../controllers/user-controller");
const { createAssociate } = require("../controllers/auth-controller");

router.post("/questions", getQuestionsByRoleAndSection);
router.post("/sections-by-user", getSectionsByUserRole);
router.post("/create-associate", createAssociate);

module.exports = router;
