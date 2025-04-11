const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");
const bcryt=require("bcrypt");



exports.VendorCreateVenue=async(req,res)=>{
  try {
    const profileId=req.params.id;
    const {street,city,state,country,postal_code,services,capacity,availaible_dates}=req.body;
    const findVendor=await VendorModel.findById(profileId);
    
  } catch (error) {
    
  }
}