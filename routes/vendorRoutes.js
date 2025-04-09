
const express=require('express');
const { VendorSignup } = require('../controllers/vendorController');

const router=express.Router();


router.route('/vendor-signup').post(VendorSignup);


module.exports=router