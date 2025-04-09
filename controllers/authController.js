const bcryt=require("bcrypt");
const jwt = require("jsonwebtoken");
const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");

// !_________________________ Host Login _______________________!
exports.Login=async(req,res)=>{
    try {
         const {email,password}=req.body;
         const emailToLowerCase=email.toLowerCase();
         let user;
         user=await HostModel.findOne({email:emailToLowerCase});
         user=await VendorModel.findOne({email:emailToLowerCase});
         if(!user){
          return res.status(404).json({message:"user not exist please signup first"});
         } 
         const matchPassword=await bcryt.compare(password,user.password);
         if(!matchPassword){
            return res.status(404).json({message:"password not matched"})
         }

         const token= jwt.sign(
          {userId: user._id,userRole:user.role},
          process.env.SECRETE_KEY,
          {
            expiresIn:'30d',
          }
         )
         res.setHeader("Authorization", `Bearer ${token}`);
         res.status(200).json({message:"loged in successfully"})
    } catch (error) {
        console.log("error",error)
         return res.status(500).json({message:"please try again.Later"})
    }
}