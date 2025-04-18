


const moment = require("moment");
const BookingModel = require("../models/bookingModel");
const HostModel = require("../models/hostModel");
const UserModel = require("../models/userModel");
const VenueModel = require("../models/venueModel");


// !___________________________ Host Profile _____________________________!
exports.HostProfile=async(req,res)=>{
  try {
        const role=req.role;
        const id=req.params.id;
        if(role !== 'host'){
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



//!_____________________ Book Venue __________________________________!
exports.CreateBooking = async (req, res) => {
  try {
    const role = req.role;
    const hostId = req.params.id;

    if (role !== "host") {
      return res.status(403).json({ message: "Only hosts can create bookings." });
    }
    const {venueId, event_date, time_slot, guests} = req.body;
    // Validate input
    if (!event_date || !time_slot) {
      return res.status(400).json({ message: "event_date and time_slot are required." });
    }

    const allowedSlots = ["morning", "afternoon", "evening"];
    if (!allowedSlots.includes(time_slot)) {
      return res.status(400).json({ message: "Invalid time slot selected." });
    }

    const venue = await VenueModel.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }
    // Check if slot is available on that day
    let parsedDate = moment(event_date, "DD-MM-YYYY", true);
    if (!parsedDate.isValid()) {
      return res.status(400).json({ message: "Invalid event_date format. Use DD-MM-YYYY." });
    }
    if (parsedDate.isBefore(moment(), "day")) {
      return res.status(409).json({ message: "Cannot book for a past date." });
    }
    console.log("data",parsedDate);
    console.log("data",event_date);
    // Check if the venue is already booked for this date and time slot
const existingBooking = await BookingModel.findOne({
  venue: venueId,
  event_date:parsedDate, // Make sure it's a Date object
  time_slot: time_slot,
  status: { $ne: "rejected" } // optional: ignore rejected bookings
});

if (existingBooking) {
  return res.status(409).json({ message: "This venue is already booked for the selected date and time slot." });
}


    // Create booking
    const booking = new BookingModel({
      host: hostId,
      vendor: venue.vendor,
      venue: venue._id,
      event_date:parsedDate,
      time_slot,
      guests,
      status: "pending",
    });

    await booking.save();

    // Add booking to venue (optional)
    venue.bookings.push(booking._id);
    await venue.save();

    return res.status(201).json({
      message: "Booking request submitted. Awaiting vendor approval.",
      booking
    });

  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


//!______________________ Single Venue _________________________________!
exports.SingleVenue=async(req,res)=>{
  try {
       const venueId=req.params.id;
       const venue=await VenueModel.findById(venueId).populate('bookings');
       if(!venue){
        return res.status(404).json({message:"venue not exist"})
       }
       res.status(200).json({message:"venue data found",venue})
  } catch (error) {
     return res.status(500).json({message:"something went wrong please try again.Later",error})
  }
}



