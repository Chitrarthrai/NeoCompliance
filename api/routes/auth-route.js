const router = require('express').Router();
const authController = require('../controllers/auth-controller');
const {auth} = require('../middlewares/auth-middleware');

router.post('/login',authController.login);                 
router.get('/logout',auth,authController.logout);         
router.get('/refresh',authController.refresh);           //   
router.post('/register', authController.createUser);


module.exports = router;