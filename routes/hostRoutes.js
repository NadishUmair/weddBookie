const express=require("express");
const { authenticateToken } = require("../middleware/userAuth");
const { HostProfile } = require("../controllers/hostController");

const router=express.Router();


router.route("/profile/:id").get(authenticateToken,HostProfile)


module.exports=router;