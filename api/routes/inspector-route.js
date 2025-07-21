const express = require('express');
const router = express.Router();
const { uploadQuestion, getScoreDetails } = require('../controllers/user-controller');
const { createInspector, createUser } = require('../controllers/auth-controller');

router.post('/upload-question', uploadQuestion);
router.post('/register', createUser);
router.post('/score-details', getScoreDetails);
router.post('/create-inspector', createInspector);


module.exports = router;
