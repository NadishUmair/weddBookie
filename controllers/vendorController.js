const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");
const bcryt=require("bcrypt");



exports.VendorSignup=async(req,res)=>{
    try {
           const {first_name,last_name,email,password,company_name,category,country,phone_no}=req.body;
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
           if(password.length < 8 ||  !/[A-h]/.test(password)){
            return res.status(400).json({
                error:
                  "Password should be at least 8 characters long and contain at least one uppercase letter",
              });
           }
             const hashPassword= await bcryt.hash(password,10);

             const newVendor=await VendorModel({
                first_name,
                last_name,
                email,
                password:hashPassword,
                company_name,
                category,
                country,
                phone_no

             
             })
            await newVendor.save();
            res.status(201).json({message:"account created successffully"});
    } catch (error) {
        console.log("error",error);
        return res.status(500).json({message:"please try agian.Later"});
    }
}