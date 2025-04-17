const express=require("express");
const { authenticateToken } = require("../middleware/userAuth");
const { HostProfile, CreateBooking } = require("../controllers/hostController");

const router=express.Router();


router.route("/profile/:id").get(authenticateToken,HostProfile);
router.route("/book-venue/:id").get(authenticateToken,CreateBooking);

module.exports=router;