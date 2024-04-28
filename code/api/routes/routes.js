const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');
const Middleware  = require('../middleware/middleware');

router.post('/signUp',controller.signUp);
router.get('/verifyEmail',controller.verifyEmail);
router.post('/login', controller.loginUser);
router.post('/adminLogin', Middleware.isAdmin, controller.adminLogin);


module.exports = router;
