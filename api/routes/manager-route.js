const express = require('express');
const router = express.Router();
const { getQuestionsByRoleAndSection, getSectionsByUserRole, getUserSectionScores, submitSectionScore } = require('../controllers/user-controller');


router.post('/questions', getQuestionsByRoleAndSection);
router.post('/sections-by-user', getSectionsByUserRole);
router.post('/scores-by-section', getUserSectionScores);
router.post('/submit-section-score', submitSectionScore);

module.exports = router;
