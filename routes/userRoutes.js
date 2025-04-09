const express = require('express');
const { signup, login, resetPassword } = require('../controllers/userController');
const router = express.Router();


router.post('/signup', signup);
router.post('/login', login); 
router.post('/reset-password', resetPassword); 

module.exports = router;
