const express = require('express');
const router = express.Router();
const { uploadQuestion, getScoreDetails } = require('../controllers/user-controller');
const { createUser } = require('../services/user-service');

router.post('/upload-question', uploadQuestion);
router.post('/register', createUser);
router.post('/score-details', getScoreDetails);


module.exports = router;
