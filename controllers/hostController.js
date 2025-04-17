


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
    const {hostId} = req.body;
    const role = req.user.role;
    const venueId = req.params.venueId;

    if (role !== "host") {
      return res.status(403).json({ message: "Only hosts can create bookings." });
    }

    const { event_date, time_slot, guests, message } = req.body;

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

    const selectedDate = new Date(event_date);
    const dayOfWeek = moment(selectedDate).format("dddd").toLowerCase(); // e.g. 'monday'

    // Check if slot is available on that day
    const timings = venue.timings.get(dayOfWeek);
    if (!timings || !timings[time_slot] || !timings[time_slot].start || !timings[time_slot].end) {
      return res.status(400).json({
        message: `Venue does not offer '${time_slot}' slot on ${dayOfWeek}.`
      });
    }

    // Create booking
    const booking = new BookingModel({
      host: hostId,
      vendor: venue.vendor,
      venue: venue._id,
      event_date: selectedDate,
      time_slot,
      guests,
      message,
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



