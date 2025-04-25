const moment = require("moment");
const BookingModel = require("../models/bookingModel");
const UserModel = require("../models/userModel");
const VenueModel = require("../models/venueModel");
const ServicesModel = require("../models/serviceModel");
const HostModel = require("../models/hostModel");
const SendEmail = require("../utils/nodemailer");
const {
  hostBookingTemplates,
  vendorBookingTemplates,
} = require("../utils/emailTemplates");
const { getUTCFromLocal } = require("../utils/timeZone");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//!__________________ Profile Update __________________________!

exports.HostCreateProfile = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      country,
      event_type,
      estimated_guests,
      event_budget,
    } = req.body;

    const userId = req.user?.id || req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided." });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.profile) {
      return res
        .status(400)
        .json({ message: "Host profile already exists for this user." });
    }

    const newHostProfile = new HostModel({
      first_name,
      last_name,
      country,
      event_type,
      estimated_guests,
      event_budget,
    });

    const savedProfile = await newHostProfile.save();

    user.profile = savedProfile._id;
    await user.save();

    return res.status(201).json({
      message: "Host profile created and linked successfully.",
      profile: savedProfile,
      user,
    });
  } catch (error) {
    console.error("Error creating host profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// !___________________________ Host Profile _____________________________!
exports.HostProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id).populate("profile");
    if (!user) {
      return res.status(404).json({ messsage: "user not exist" });
    }
    if (!user || user.role !== "host") {
      return res
        .status(400)
        .json({ message: "you are not authorized to acess this profile" });
    }
    res
      .status(200)
      .json({ message: "user profile found", profile: user.profile });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "please try again.Later" });
  }
};

//!______________________ Upodate profile ______________________________!
exports.HostUpdateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "host") {
      return res
        .status(403)
        .json({ message: "Only host users can update a host profile" });
    }

    if (!user.profile) {
      return res.status(400).json({ message: "Host profile does not exist" });
    }

    const updatedProfile = await HostModel.findByIdAndUpdate(
      user.profile,
      { $set: updates },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(500).json({ message: "Failed to update host profile" });
    }

    return res.status(200).json({
      message: "Host profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating host profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//!_____________________ Book Venue __________________________________!
exports.CreateVenueBooking = async (req, res) => {
  try {
    const hostId = req.params.id;
    const host = await UserModel.findById(hostId).populate("profile");
    if (!host || host.role !== "host") {
      return res
        .status(403)
        .json({ message: "Only hosts can create bookings." });
    }
    const { venueId, event_date, time_slot, guests, extra_services, timezone } =
      req.body;
    if (!event_date || !time_slot || !timezone) {
      return res
        .status(400)
        .json({ message: "event_date, time_slot, and timezone are required." });
    }

    const { utcMoment, error } = getUTCFromLocal(
      event_date,
      time_slot,
      timezone
    );
    if (error) {
      return res.status(400).json({ message: error });
    }

    const venue = await VenueModel.findById(venueId)
      .select("extra_services bookings name") // Select only the necessary fields of the venue
      .populate("vendor", "_id"); // Populate vendor and select only email and first_name
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Ensure the vendor is populated with the email
    const vendor = await UserModel.findOne({ profile: venue.vendor._id })
      .select("email role profile") // include 'role' so populate works!
      .populate("profile", "first_name"); // now this will work properly

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const existingBooking = await BookingModel.findOne({
      venue: venueId,
      event_date: utcMoment,
      time_slot,
      status: { $ne: "rejected" },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This venue is already booked for the selected date and time.",
      });
    }

    const SelectedExtra = extra_services?.map((id) => {
      const service = venue.extra_services.find((s) => s._id.toString() === id);
      if (!service) {
        throw new Error("Invalid extra service selected");
      }
      return { name: service.name, price: service.price };
    });

    const booking = new BookingModel({
      host: hostId,
      vendor: venue.vendor,
      venue: venue._id,
      event_date: utcMoment,
      time_slot,
      guests,
      extra_services: SelectedExtra,
      timezone,
    });

    await booking.save();
    venue.bookings.push(booking._id);
    await venue.save();
    const hostBookingTemplate = hostBookingTemplates(
      host.profile.first_name,
      venue.name,
      utcMoment.format("dddd, MMMM Do YYYY, h:mm A")
    );
    const vendorBookingTemplate = vendorBookingTemplates(
      vendor.profile.first_name,
      venue.name,
      utcMoment.format("dddd, MMMM Do YYYY, h:mm A"),
      host.profile.first_name
    );
    // Send emails to host and vendor
    await SendEmail(res, host.email, hostBookingTemplate);
    await SendEmail(res, vendor.email, vendorBookingTemplate); // Send email to vendor
    return res.status(201).json({
      message: "Booking request submitted. Awaiting vendor approval.",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


//!______________________ Get Single Venue Detail ___________________________1
exports.SingleVenue=async(req,res)=>{
  try {
      const venueId=req.params.id;
      const venue=await VenueModel.findById(venueId).populate('bookings');
      if(!venue){
        return res.status(404).json({message:"venue not found"})
      }
      return res.status(200).json({message:"venue",venue});
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"plase try again.Later"}) 
  }
}


// exports.CreateVenueBooking = async (req, res) => {
//   try {
//     const role = req.role;
//     const hostId = req.params.id;

//     if (role !== "host") {
//       return res.status(403).json({ message: "Only hosts can create bookings." });
//     }

//     const { venueId, event_date, time_slot, guests, extra_services = [] } = req.body;

//     // Validate date and time slot
//     if (!event_date || !time_slot) {
//       return res.status(400).json({ message: "event_date and time_slot are required." });
//     }

//     const allowedSlots = ["morning", "afternoon", "evening"];
//     if (!allowedSlots.includes(time_slot)) {
//       return res.status(400).json({ message: "Invalid time slot selected." });
//     }

//     const venue = await VenueModel.findById(venueId);
//     if (!venue) {
//       return res.status(404).json({ message: "Venue not found." });
//     }

//     let parsedDate = moment(event_date, "DD-MM-YYYY", true);
//     if (!parsedDate.isValid()) {
//       return res.status(400).json({ message: "Invalid date format. Use DD-MM-YYYY." });
//     }

//     if (parsedDate.isBefore(moment(), "day")) {
//       return res.status(409).json({ message: "Cannot book for a past date." });
//     }

//     // Check if slot is available
//     const existingBooking = await BookingModel.findOne({
//       venue: venueId,
//       event_date: parsedDate,
//       time_slot: time_slot,
//       status: { $ne: "rejected" },
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         message: "This venue is already booked for the selected date and time slot.",
//       });
//     }

//     // Prepare extra services
//     const SelectedExtra = extra_services.map((id) => {
//       const service = venue.extra_services.find((s) => s._id.toString() === id);
//       if (!service) throw new Error("Invalid extra service selected");
//       return {
//         name: service.name,
//         price: Number(service.price) || 0,
//       };
//     });

//     // Calculate total cost (venue base price + extra services)
//     const venuePrice = Number(venue.price) || 0;
//     const extraServiceTotal = SelectedExtra.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
//     const totalAmount = venuePrice + extraServiceTotal;

//     console.log("💰 Venue Price:", venuePrice);
//     console.log("💰 Extra Services Total:", extraServiceTotal);
//     console.log("💰 Total Stripe Amount (in cents):", totalAmount * 100);
//     // Create a Stripe Payment Intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(totalAmount * 100),
//       currency: "usd",
//       metadata: {
//         venueId: venue._id.toString(),
//         event_date: parsedDate.toISOString(),
//         time_slot,
//         hostId,
//         extra_services: JSON.stringify(extra_services),
//         guests,
//       },
//     });

//     // Respond with Stripe payment client secret
//     return res.status(200).json({
//       message: "Proceed to payment",
//       clientSecret: paymentIntent.client_secret,
//     });

//   } catch (error) {
//     console.error("Booking error:", error);
//     return res.status(500).json({ message: "Something went wrong", error: error.message });
//   }
// };

// ?###

//!___________________ Buy Service ________________________________!
exports.BuyService = async (req, res) => {
  try {
    const hostId = req.params.id;
    const host = await UserModel.findById(hostId).populate("profile");

    if (!host || host.role !== "host") {
      return res
        .status(404)
        .json({ message: "Host user not found or unauthorized" });
    }

    const { serviceId, event_date, timezone } = req.body;

    // Ensure all required parameters are present
    if (!event_date || !timezone) {
      return res
        .status(400)
        .json({ message: "Time and timezone are required." });
    }

    // Use the utility function to convert local time to UTC
    const { utcMoment, error } = getUTCFromLocal(event_date, "00:00", timezone); // Assuming '00:00' is the time placeholder
    if (error) {
      return res.status(400).json({ message: error });
    }

  
   console.log("host",host);
    const service = await ServicesModel.findById(serviceId).populate("vendor");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    console.log("service",service);
    // Create the booking with the UTC date
    const newBooking = new BookingModel({
      service: service._id,
      host: host._id,
      vendor: service.vendor._id,
      event_date: utcMoment.toDate(), // Save the UTC time to the database
    });

    await newBooking.save();

    // Push the new booking ID to the service's bookings array
    service.bookings.push(newBooking._id);
    await service.save();

    // Build and send the email using the template
    const emailTemplate = hostBookingTemplates(
      host.profile.first_name,
      service.title,
      utcMoment.format("dddd, MMMM Do YYYY, h:mm A") // Format the UTC time
    );

    await SendEmail(res, host.email, emailTemplate);

    res.status(201).json({ message: "Service booked successfully." });
  } catch (error) {
    console.error("BuyService Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

// exports.BuyService = async (req, res) => {
//   try {
//     const hostId = req.params.id;  // Assuming the hostId is passed as a parameter in the URL
//     const { serviceId, time } = req.body;

//     // 1. Find the service in the database
//     const service = await ServicesModel.findById(serviceId);
//     if (!service) {
//       return res.status(404).json({ message: "Service not found." });
//     }

//     // 2. Calculate the total amount for the service
//     let totalAmount = service.price; // The base price of the service

//     // 3. Create a Stripe Payment Intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalAmount * 100, // Stripe expects the amount in cents
//       currency: 'usd',
//       metadata: {
//         serviceId: service._id.toString(),
//         hostId,
//         time,
//       },
//     });

//     // 4. Respond with the client secret for the Stripe payment
//     res.status(200).json({
//       message: "Proceed to payment",
//       clientSecret: paymentIntent.client_secret,
//     });

//   } catch (error) {
//     console.error("Error processing service booking:", error);
//     res.status(500).json({ message: "Something went wrong", error: error.message });
//   }
// };


