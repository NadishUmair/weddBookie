const express=require("express");
const { HostSignup} = require("../controllers/hostController");
const router=express.Router();


router.route("/host-signup").post(HostSignup);



module.exports=router;