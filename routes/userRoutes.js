const express = require('express');
const { signup, login, forgetPassword, verifyOtp, resetPassword, updatePassword} = require('../controllers/userController');
const {checkForgetToken,authenticateToken} = require('../middleware/userAuth');
const router = express.Router();


router.post('/signup', signup);
router.post('/login',login); 
router.post('/forget-password', forgetPassword); 
router.route('/verify-otp').post(checkForgetToken,verifyOtp); 
router.route('/reset-password').post(checkForgetToken,resetPassword); 
router.route('/update-password/:id').post(authenticateToken,updatePassword); 

module.exports = router;
