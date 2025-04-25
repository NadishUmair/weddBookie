
const express=require('express');
const { authenticateToken } = require('../middleware/userAuth');
const { CreateVenue, UpdateVenue, VendorProfile, DeleteVenue, DeleteVenueService, VendorVenues, VendorSingleVenue, CreateService, UpdateService, DeleteService, VendorCreateProfile, VendorUpdateProfile } = require('../controllers/vendorController');


const router=express.Router();


router.route('/create-profile/:id').post(authenticateToken,VendorCreateProfile);
router.route('/update-profile/:id').put(authenticateToken,VendorUpdateProfile);
router.route('/create-venue/:id').post(authenticateToken,CreateVenue);
router.route('/update-venue/:id').put(authenticateToken,UpdateVenue);
router.route('/vendor-profile/:id').get(authenticateToken,VendorProfile);
router.route('/delete-venue/:id').delete(authenticateToken,DeleteVenue);
router.route('/vendor-venues/:id').get(authenticateToken,VendorVenues);
router.route('/vendor-venue/:id').get(authenticateToken,VendorSingleVenue);
router.route('/create-service/:id').post(authenticateToken,CreateService);
router.route('/update-service/:id').put(authenticateToken,UpdateService);
router.route('/delete-service/:id').delete(authenticateToken,DeleteService);

module.exports=router;