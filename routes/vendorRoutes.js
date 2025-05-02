
const express=require('express');

const { CreateVenue, UpdateVenue, VendorProfile, DeleteVenue, VendorVenues, VendorSingleVenue, CreateService, UpdateService, DeleteService, VendorUpdateProfile, GetVendorBookings, VendorSingleBooking, VendorSignup, VendorLogin, VendorForgetPassword, VendorVerifyOtp, VendorResetPassword, UpdateVendorProfile, CreatePackage, UpdatePackage, DeletePackage, GetAllPackages, VendorUpdatePassword } = require('../controllers/vendorController');
const {vendorAuthentication, CheckVendorForgetToken} = require('../middleware/vendorAuth');


const router=express.Router();


router.route('/vendor-signup').post(VendorSignup);
router.route('/vendor-login').post(VendorLogin);
router.route("/vendor-forget-password").post(VendorForgetPassword);
router.route("/vendor-verify-otp").post(CheckVendorForgetToken,VendorVerifyOtp);
router.route("/vendor-reset-password").post(CheckVendorForgetToken,VendorResetPassword);
router.route("/vendor-update-password/:id").post(vendorAuthentication,VendorUpdatePassword);
router.route('/update-profile/:id').put(vendorAuthentication,UpdateVendorProfile);


router.route('/create-service/:id').post(vendorAuthentication,CreateService);
router.route('/update-service/:id').put(vendorAuthentication,UpdateService);
router.route('/delete-service/:id').delete(vendorAuthentication,DeleteService);
router.route('/vendor-bookings/:id').get(vendorAuthentication,GetVendorBookings);
router.route('/vendor-booking-detail/:id').get(vendorAuthentication,VendorSingleBooking);

router.route('/create-package/:id').post(vendorAuthentication,CreatePackage);
router.route('/update-package/:id').put(vendorAuthentication,UpdatePackage);
router.route('/delete-package/:id').delete(vendorAuthentication,DeletePackage);
router.route('/all-packages/:id').get(vendorAuthentication,GetAllPackages);



module.exports=router;