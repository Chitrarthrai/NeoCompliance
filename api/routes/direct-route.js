const express = require('express');
const router = express.Router();
const { uploadQuestion, getScoreDetails, assignStoresToUser } = require('../controllers/user-controller');
const { createUser } = require('../controllers/auth-controller');
const { createInspector } = require('../controllers/auth-controller');

router.post('/upload-question', uploadQuestion);
router.post('/register', createUser);
router.post('/score-details', getScoreDetails);
router.post('/assign-stores', assignStoresToUser);
router.post('/create-inspector', createInspector);


module.exports = router;
