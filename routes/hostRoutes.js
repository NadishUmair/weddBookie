const express=require("express");
const { hostAuthentication, CheckHostForgetToken } = require("../middleware/hostAuth");
const { HostProfile, SingleVenue,BuyService, HostCreateProfile, HostUpdateProfile, GetAllMyBookings, HostBookingDetail, HostSignup, HostLogin, HostForgetPassword, HostVerifyOtp, HostResetPassword, CreateVendorBooking, GetAllVendors, HostUpdatePassword, GiveReview, SingleVendor } = require("../controllers/hostController");

const router=express.Router();


router.route("/host-signup").post(HostSignup);
router.route("/host-login").post(HostLogin);
router.route("/host-forget-password").post(HostForgetPassword);
router.route("/host-verify-otp").post(CheckHostForgetToken,HostVerifyOtp);
router.route("/host-reset-password").post(CheckHostForgetToken,HostResetPassword);
router.route("/host-update-password/:id").post(hostAuthentication,HostUpdatePassword);
router.route("/create-profile/:id").post(hostAuthentication,HostCreateProfile);
router.route("/update-profile/:id").put(hostAuthentication,HostUpdateProfile);
router.route("/profile/:id").get(hostAuthentication,HostProfile);
router.route("/book-package/:id").post(hostAuthentication,CreateVendorBooking);
router.route("/book-service/:id").post(hostAuthentication,BuyService);
router.route("/single-vendor/:id").get(hostAuthentication,SingleVendor);
router.route("/my-bookings/:id").get(hostAuthentication,GetAllMyBookings);
router.route("/host-booking-detail/:id").get(hostAuthentication,HostBookingDetail);
router.route("/all-vendors").get(hostAuthentication,GetAllVendors);
router.route("/give-review/:id").post(hostAuthentication,GiveReview);

module.exports=router;