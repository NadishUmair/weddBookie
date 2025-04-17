
const express=require('express');
const { authenticateToken } = require('../middleware/userAuth');
const { CreateVenue, UpdateVenue, VendorProfile, DeleteVenue } = require('../controllers/vendorController');


const router=express.Router();


router.route('/create-venue/:id').post(authenticateToken,CreateVenue);
router.route('/update-venue/:id').patch(authenticateToken,UpdateVenue);
router.route('/vendor-profile/:id').get(authenticateToken,VendorProfile);
router.route('/delete-venue/:id').delete(authenticateToken,DeleteVenue);

module.exports=router