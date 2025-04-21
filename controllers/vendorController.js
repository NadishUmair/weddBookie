
const VendorModel = require("../models/vendorModel");
const VenueModel = require("../models/venueModel");
const UserModel = require("../models/userModel");
const validateTimings = require("../utils/venueUtils");
const ServicesModel = require("../models/serviceModel");


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
    const {title,street,city,state,country,postal_code,services,capacity,timings,extra_services}=req.body;
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
        timings,
        extra_services
     });
     await newVenue.save();
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

// //!_____________________  Delete a Service from Venue__________________!
// exports.DeleteVenueService=async(req,res)=>{
//   try {
//       const vendorId=req.params.id;
//       const {venueId,serviceId}=req.body;

//       const updateResult=await VenueModel.findOne({
//         vendor:vendorId,
//         _id:venueId, },
//       {
//         $pull:{
//           extra_services:{_id:serviceId}
//         }
//       })
//        if (updateResult.modifiedCount === 0) {
//       return res.status(404).json({ message: "Service not found or not authorized to delete." });
//     }
      
//     return res.status(200).json({ message: "Service deleted successfully." });

//   } catch (error) {
//     console.error("Error deleting extra service:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// }


//!______________________________ Get all vendor Venues _______________________!
exports.VendorVenues=async(req,res)=>{
  try {
        const vendorId=req.params.id;
        const vendorDetail=await VendorModel.findById(vendorId).populate("venues");
        if(!vendorDetail){
          return res.status(404).json({message:"venues not exist"})
        }
        res.status(200).json({message:"venues of the user",vendorDetail})
  } catch (error) {
     console.log("error",error);
     return res.status(500).json({message:"please try again.Later"})
  }
}


//!_______________________ Vendor Single Venue _________________________!
exports.VendorSingleVenue=async(req,res)=>{
  try {
     const vendorId=req.params.id;
     const {venueId}=req.body;
     const venue=await VenueModel.findById(venueId);
     if(!venue){
      return res.status(404).json({message:"venue not found"}); 
     }
     if (venue.vendor.toString() !== vendorId){
      return res.status(401).json({message:"not authorized to this venue"});
     } 
     res.status(200).json({message:"venue founded",venue});
  } catch (error) {
    return res.status(500).json({message:'please try again.Later'})
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
          return res.status(409).json({message:"vendor not exist "});
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


//!_________________ Vendor Create Service _________________!
exports.CreateService=async(req,res)=>{
  try {
       const vendorId=req.params.id;
       const profile=await VendorModel.findById(vendorId);
       if(!profile){
        return res.status(404).json({message:"vendor not exist"})
       }
       const {title,description,price,category,}=req.body;
       const newService=new ServicesModel({
         title,
         description,
         price,
         category,
         vendor:vendorId,
       })
       await newService.save();
       profile.services.push(newService._id);
       await profile.save();
       res.status(201).json({message:"service created Successuly"})
    
  } catch (error) {
    return res.status(500).json({message:"please try again.Later"})
  }
}