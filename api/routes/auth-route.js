const router = require('express').Router();
const { login, logout, refresh, createUser } = require('../controllers/auth-controller');
const {auth} = require('../middlewares/auth-middleware');

router.post('/login', login);
router.get('/logout', auth, logout);
router.get('/refresh', refresh);

module.exports = router;