
const VendorModel = require("../models/vendorModel");
const VenueModel = require("../models/venueModel");
const UserModel = require("../models/userModel");
const validateTimings = require("../utils/venueUtils");


//!___________________ Vendor Profile __________________!
exports.VendorProfile=async(req,res)=>{
  try {
        const role=req.role;
        const id=req.params.id;
        if(role !== 'vendor'){
          return res.status(400).json({message:"user are not authorized to this profile"})
        }
        const user=await UserModel.findById(id).populate('profile');
        if(!user){
           return res.status(404).json({messsage:"user not exist"})
        }
        if(role !== user.role){
          return res.status(400).json({message:"you are not authorized to acess this profile"})
        }
        res.status(200).json({message:"user profile found",profile:user.profile})
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"please try again.Later"})
  }
}

// !__________________________ Create Venue ________________!
exports.CreateVenue=async(req,res)=>{
  try {
     const role=req.role;
     console.log("role",role);
     if(role !== 'vendor'){
      return res.status(401).json({message:"you are not authorized to create venue"});
     }
    const profileId=req.params.id;
    const {title,street,city,state,country,postal_code,services,capacity,timings}=req.body;
    const profile=await VendorModel.findById(profileId);
    if(!profile){
      return res.status(404).json({message:"vendor profile not exist"})
    };
    // console.log("verification",profile.verification);
    if(profile.verification === 'under_review'){
      return res.status(401).json({message:"you can't process because your profile is under review"});
    }
    if(profile.verification === 'rejected'){
      return res.status(401).json({message:"you'r vendor profile is rejected please contact administration"});
    }
    // Basic check assuming timings is an object like: { start: "21:00", end: "20:00" }
    const timingError = validateTimings(timings);
    if (timingError) {
      return res.status(400).json({ message: timingError });
    }
    

     const newVenue=new VenueModel({
        vendor:profileId,
        title,
        street,
        city,
        state,
        country,
        postal_code,
        services,
        capacity,
        timings
     });
     await newVenue.save();
     console.log("venue",newVenue._id);
     profile.venues.push(newVenue._id);
     await profile.save();
     res.status(201).json({
      message:"venue created successfully"
     })
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"please try again.Later"})
  }
}

// !__________________ Update Venue _______________________!
exports.UpdateVenue = async (req, res) => {
  try {
    const role = req.role;
    console.log('role',role);
    const vendorId = req.params.id;
    const {updateData,venueId} = req.body;
    if (role !== 'vendor') {
      return res.status(401).json({ message: "You are not authorized to update a venue" });
    } 
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile does not exist" });
    }

    const venue = await VenueModel.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "venue not exist" });
    }

    if (!venue.vendor.equals(vendor._id)) {
      return res.status(403).json({ message: "This venue does not belong to you" });
    }

    // Update the venue fields
    Object.assign(venue, updateData);
    await venue.save();

    res.status(200).json({
      message: "Venue updated successfully",
      venue
    });

  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ message: "Please try again later" });
  }
};


//!___________________ Delete Venue _______________________!
exports.DeleteVenue=async(req,res)=>{
  try {
         const vendorId = req.params.id;
         const {venueId} = req.body;
         console.log("venueId",venueId);
         console.log("vendorId",vendorId);
         const vendor = await VendorModel.findByIdAndUpdate(
          vendorId,
          { $pull: { venues: venueId } }, 
          { new: true }
        );
         if(!vendor){
          return res.status(409).json({message:"venue not belong to you"});
         }
         const venue=await VenueModel.findByIdAndDelete(venueId);
         if(!venue){
          return res.status(409).json({message:"venue not belong to you"});
         }
       
    return res.status(200).json({ message: "Venue deleted successfully", vendor });   
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
