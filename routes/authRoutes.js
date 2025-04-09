const express=require("express");

const { Login } = require("../controllers/authController");
const router=express.Router();



router.route("/login").post(Login);


module.exports=router;