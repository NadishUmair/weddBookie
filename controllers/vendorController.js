const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");
const bcryt=require("bcrypt");
const VenueModel = require("../models/venueModel");


// !__________________________ Create Venue ________________!
exports.CreateVenue=async(req,res)=>{
  try {
     const role=req.role;
    //  console.log("role",req.role);
     if(role !== 'vendor'){
      return res.status(401).json({message:"you are not authorized to create venue"});
     }
    const profileId=req.params.id;
    const {title,street,city,state,country,postal_code,services,capacity,timings}=req.body;
    const profile=await VendorModel.findById(profileId);
    if(!profile){
      return res.status(404).json({message:"vendor profile not exist"})
    };
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
     profile.venues=newVenue._id;
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
      return res.status(404).json({ message: "Venue not found" });
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
