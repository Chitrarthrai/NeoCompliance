const express = require('express');
const router = express.Router();
const { getQuestionsByRoleAndSection, getSectionsByUserRole } = require('../controllers/user-controller');

router.post('/questions', getQuestionsByRoleAndSection);
router.post('/sections-by-user', getSectionsByUserRole);

module.exports = router;
