const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

router.post('/upload-question', userController.uploadQuestion);
router.post('/sections-by-user', userController.getSectionsByUserRole);

module.exports = router;
