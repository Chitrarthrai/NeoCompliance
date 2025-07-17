const express = require('express');
const router = express.Router();
const { uploadQuestion } = require('../controllers/user-controller');
const { createUser } = require('../services/user-service');

router.post('/upload-question', uploadQuestion);
router.post('/register', createUser);


module.exports = router;
