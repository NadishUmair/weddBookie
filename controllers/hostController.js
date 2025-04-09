const HostModel = require("../models/hostModel");
const bcryt=require("bcrypt");
const jwt = require("jsonwebtoken");
const VendorModel = require("../models/vendorModel");
// !_______________________ Host Signup _________________________!
exports.HostSignup=async(req,res)=>{
    try {
       console.log("body",req.body);
       const {first_name,last_name,email,password,event_type,estimated_guests,event_budget,interested_vendors}=req.body;
    
       if (!first_name || !last_name || !email || !password || !event_type || !estimated_guests || !event_budget) {
        return res.status(400).json({ message: "All fields are required and must not be empty." });
        }
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
         return res
           .status(400)
           .json({ error: "Invalid email address", email});
       }
       const emailToLowerCase=email.toLowerCase();
       const hostExist = await HostModel.findOne({ email: emailToLowerCase });
       const vendorExist = await VendorModel.findOne({ email: emailToLowerCase });
   
       if (hostExist || vendorExist) {
         return res.status(400).json({ message: "Email is already registered with another account." });
       }
       if (password.length < 8 || !/[A-Z]/.test(password)) {
        return res.status(400).json({
          error:
            "Password should be at least 8 characters long and contain at least one uppercase letter",
        });
      }
       const hashPassword= await bcryt.hash(password,10);
       const newHostUser=new HostModel({
        first_name,
        last_name,
        email:emailToLowerCase,
        password:hashPassword,
        event_type,
        estimated_guests,
        event_budget,
        interested_vendors
       })
       await newHostUser.save();
       return res.status(200).json({message:"account created successfully"})
    } catch (error) {
        console.log("error",error);
      return res.status(500).json({message:"please try again later"})  
    }
}


