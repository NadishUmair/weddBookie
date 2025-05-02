
const express=require('express');
const { AdminSignUp, AdminLogin, VerifyAdmin2FA } = require('../controllers/adminController');

const router=express.Router();


router.route('/admin-signup').post(AdminSignUp);
router.route('/admin-login').post(AdminLogin);
router.route('/admin-verify2fa').post(VerifyAdmin2FA);
module.exports=router;