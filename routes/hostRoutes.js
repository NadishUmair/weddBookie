const express=require("express");
const { authenticateToken } = require("../middleware/userAuth");
const { HostProfile, CreateBooking, SingleVenue, CreateVenueBooking, BuyService, HostCreateProfile, HostUpdateProfile } = require("../controllers/hostController");

const router=express.Router();


router.route("/create-profile/:id").post(authenticateToken,HostCreateProfile);
router.route("/update-profile/:id").put(authenticateToken,HostUpdateProfile);
router.route("/profile/:id").get(authenticateToken,HostProfile);
router.route("/book-venue/:id").post(authenticateToken,CreateVenueBooking);
router.route("/book-service/:id").post(authenticateToken,BuyService);
router.route("/single-venue/:id").get(authenticateToken,SingleVenue);

module.exports=router;