
const VendorModel = require("../models/vendorModel");
const VenueModel = require("../models/venueModel");
const UserModel = require("../models/userModel");
const validateTimings = require("../utils/venueUtils");
const ServicesModel = require("../models/serviceModel");

//!__________________ Profile Update __________________________!
exports.VendorCreateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can create a vendor profile.' });
    }
    if (user.profile) {
      return res.status(400).json({ message: 'profile already exists for this user.' });
    }

    const {
      first_name,
      last_name,
      category,
      country,
      business_registration,
      business_license_number,
      business_license_doc,
      street,
      city,
      state,
      postal_code,
      website,
      social_links,
      business_type,
      tax_id_number,
      years_of_experience,
    } = req.body;

    // Required field check
    if (
      !first_name || !category || !country || !business_license_number || !business_registration ||
      !tax_id_number || !street || !city || !state || !postal_code || !website
    ) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const newVendorProfile = new VendorModel({
      first_name,
      last_name,
      phone_no: user.phone_no,
      country,
      category,
      business_registration,
      business_license_number,
      business_license_doc,
      street,
      city,
      state,
      postal_code,
      website,
      social_links,
      business_type,
      tax_id_number,
      years_of_experience,
    });

    const savedProfile = await newVendorProfile.save();

    user.profile = savedProfile._id;
    await user.save();

    return res.status(201).json({
      message: 'Vendor profile created and linked successfully.',
      profile: savedProfile,
      user,
    });
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


//!_____________ Update Vendor Profile ____________________________!
exports.VendorUpdateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendor users can update a vendor profile' });
    }

    if (!user.profile) {
      return res.status(400).json({ message: 'Vendor profile does not exist' });
    }

    const updatedProfile = await VendorModel.findByIdAndUpdate(
      user.profile,
      { $set: updates },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(500).json({ message: 'Failed to update vendor profile' });
    }

    return res.status(200).json({
      message: 'Vendor profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};






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
     const userId=req.params.id;
      const user=await UserModel.findById(userId).populate('profile');
      console.log("user",user);
      if (!user || user.role !== "vendor") {
        return res.status(404).json({ message: "vendor user not found or unauthorized" });
      }
   
    const {name,street,city,state,country,postal_code,services,capacity,timings,extra_services}=req.body;
    // console.log("verification",profile.verification);
    if(user.profile.verification === 'under_review'){
      return res.status(401).json({message:"you can't process because your profile is under review"});
    }
    if(user.profile.verification === 'rejected'){
      return res.status(401).json({message:"you'r vendor profile is rejected please contact administration"});
    }
    // Basic check assuming timings is an object like: { start: "21:00", end: "20:00" }
    const timingError = validateTimings(timings);
    if (timingError) {
      return res.status(400).json({ message: timingError });
    }
     const newVenue=new VenueModel({
        vendor:user.profile._id,
        name,
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
     user.profile.venues.push(newVenue._id);
     await user.profile.save();
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
exports.VendorVenues = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(userId)
      .select("-password") // ⛔ exclude password
      .populate({
        path: "profile",
        populate: {
          path: "venues", // ✅ populate venues inside profile
        },
      });

    if (!user || user.role !== "vendor") {
      return res
        .status(404)
        .json({ message: "Vendor user not found or unauthorized" });
    }

    res.status(200).json({
      message: "Venues retrieved successfully",
      venues: user.profile.venues || [],
    });
  } catch (error) {
    console.log("VendorVenues Error:", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};



//!_______________________ Vendor Single Venue _________________________!
exports.VendorSingleVenue=async(req,res)=>{
  try {
     const userId=req.params.id;
     const {venueId}=req.body;
     const venue=await VenueModel.findById(venueId);
     if(!venue){
      return res.status(404).json({message:"venue not found"}); 
     }
     if (venue.vendor.toString() !== userId){
      return res.status(401).json({message:"not authorized to this venue"});
     } 
     res.status(200).json({message:"venue founded",venue});
  } catch (error) {
    return res.status(500).json({message:'please try again.Later'})
  }
}


// !__________________ Update Venue _______________________!s

exports.UpdateVenue = async (req, res) => {
  try {
    const userId = req.params.id;
    const { updateData, venueId } = req.body;

    if (!updateData || !venueId) {
      return res.status(400).json({ message: "Missing update data or venue ID." });
    }

    const user = await UserModel.findById(userId).populate('profile');

    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor user not found or unauthorized.' });
    }
    
    const updatedVenue = await VenueModel.findOneAndUpdate(
      { _id: venueId, vendor: user.profile._id }, // filter
      { $set: updateData },                       // update
      {
        new: true,             // return updated document
        runValidators: true,   // validate before saving
      }
    )
     
    
    if (!updatedVenue) {
      return res.status(404).json({ message: 'Venue not found or not owned by this vendor.' });
    }

    return res.status(200).json({
      message: 'Venue updated successfully.',
      venue: updatedVenue,
    });

  } catch (error) {
    console.error('Error updating venue:', error);
    return res.status(500).json({ message: 'Please try again later.' });
  }
};



//!___________________ Delete Venue _______________________!
exports.DeleteVenue = async (req, res) => {
  try {
    const userId = req.params.id;
    const { venueId } = req.body;

    // 1. Fetch user and ensure they are a vendor
    const user = await UserModel.findById(userId).populate("profile");

    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Unauthorized or user not found." });
    }

    const vendorProfile = user.profile;

    if (!vendorProfile.venues.includes(venueId)) {
      return res.status(404).json({ message: "Venue does not belong to this vendor." });
    }

    // 2. Remove venue reference from vendor profile
    vendorProfile.venues.pull(venueId);
    await vendorProfile.save();

    // 3. Delete the venue from DB
    const deletedVenue = await VenueModel.findByIdAndDelete(venueId);
    if (!deletedVenue) {
      return res.status(404).json({ message: "Venue not found in database." });
    }

    res.status(200).json({
      message: "Venue deleted successfully.",
      deletedVenueId: venueId,
    });

  } catch (error) {
    console.error("DeleteVenue Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



//!_________________ Vendor Create Service _________________!
exports.CreateService = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId).populate("profile");

    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Unauthorized or user not found." });
    }

    const { title, description, price, category } = req.body;

    // Create new service with correct vendor ID
    const newService = new ServicesModel({
      title,
      description,
      price,
      category,
      vendor: user.profile._id, // <-- fix here
    });

    await newService.save();

    // Add to profile's services and save profile
    user.profile.services.push(newService._id);
    await user.profile.save(); // <-- save the profile, not the user

    return res.status(201).json({ message: "Service created successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};


//!_________________ Update Service _____________________!
exports.UpdateService=async(req,res)=>{
  try {
      
      const {serviceId,title,price,description,category}=req.body;
      const userId = req.params.id;
      const user = await UserModel.findById(userId).populate("profile");
      console.log("user",user.profile._id);
      if (!user || user.role !== "vendor") {
        return res.status(403).json({ message: "Unauthorized or user not found." });
      }
        const service=await ServicesModel.findById(serviceId);
        if(!service){
          return res.status(404).json({message:"service not exist"});
        }
        console.log("user",service.vendor);
        if(service.vendor.toString() !== user.profile._id.toString()){
          return res.status(401).json({message:"not authorized to update"});
        }
       service.title=title
       service.description=description
       service.category=category
       service.price=price
       await service.save();
       res.status(200).json({message:"service updated"})
      
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"please try again.Later"})
  }
}

//!_________________ Delete Service ___________________________!
exports.DeleteService = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { serviceId } = req.body;

    const service = await ServicesModel.findOne({ _id: serviceId, vendor: vendorId });

    if (!service) {
      return res.status(404).json({ message: 'Service not found for this vendor' });
    }
    await ServicesModel.findByIdAndDelete(serviceId);
    await VendorModel.findByIdAndUpdate(vendorId, {
      $pull: { services: serviceId }
    });
    return res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('DeleteService Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


