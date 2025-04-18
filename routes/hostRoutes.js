const express=require("express");
const { authenticateToken } = require("../middleware/userAuth");
const { HostProfile, CreateBooking, SingleVenue } = require("../controllers/hostController");

const router=express.Router();


router.route("/profile/:id").get(authenticateToken,HostProfile);
router.route("/book-venue/:id").post(authenticateToken,CreateBooking);
router.route("/single-venue/:id").post(authenticateToken,SingleVenue);

module.exports=router;