const moment = require("moment");
const BookingModel = require("../models/bookingModel");
const UserModel = require("../models/userModel");
const VenueModel = require("../models/venueModel");
const ServicesModel = require("../models/serviceModel");
const HostModel = require("../models/hostModel");
const SendEmail = require("../utils/nodemailer");
const { hostBookingTemplates } = require("../utils/emailTemplates");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// !___________________________ Host Profile _____________________________!
exports.HostProfile = async (req, res) => {
  try {
    const role = req.role;
    const id = req.params.id;
    if (role !== "host") {
      return res
        .status(400)
        .json({ message: "user are not authorized to this profile" });
    }
    const user = await UserModel.findById(id).populate("profile");
    if (!user) {
      return res.status(404).json({ messsage: "user not exist" });
    }
    if (role !== user.role) {
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

//!_____________________ Book Venue __________________________________!
exports.CreateVenueBooking = async (req, res) => {
  try {
    const role = req.role;
    const hostId = req.params.id;

    if (role !== "host") {
      return res
        .status(403)
        .json({ message: "Only hosts can create bookings." });
    }
    const { venueId, event_date, time_slot, guests, extra_services } = req.body;
    // Validate input
    if (!event_date || !time_slot) {
      return res
        .status(400)
        .json({ message: "event_date and time_slot are required." });
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
      return res
        .status(400)
        .json({ message: "Invalid event_date format. Use DD-MM-YYYY." });
    }
    if (parsedDate.isBefore(moment(), "day")) {
      return res.status(409).json({ message: "Cannot book for a past date." });
    }

    // Check if the venue is already booked for this date and time slot
    const existingBooking = await BookingModel.findOne({
      venue: venueId,
      event_date: parsedDate,
      time_slot: time_slot,
      status: { $ne: "rejected" }, // optional: ignore rejected bookings
    });

    if (existingBooking) {
      return res.status(409).json({
        message:
          "This venue is already booked for the selected date and time slot.",
      });
    }
    // Create booking
    console.log("extra services", extra_services);
    const SelectedExtra = extra_services?.map((id) => {
      const service = venue.extra_services.find((s) => s._id.toString() === id);
      if (!service) throw new Error("Invalid extra service selected");
      return {
        name: service.name,
        price: service.price,
      };
    });
    const booking = new BookingModel({
      host: hostId,
      vendor: venue.vendor,
      venue: venue._id,
      event_date: parsedDate,
      time_slot,
      guests,
      extra_services: SelectedExtra,
    });

    await booking.save();

    venue.bookings.push(booking._id);
    await venue.save();

    return res.status(201).json({
      message: "Booking request submitted. Awaiting vendor approval.",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

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
    const user = await UserModel.findById(hostId).populate("profile");
    if (!user || user.role !== "host") {
      return res.status(404).json({ message: "Host user not found or unauthorized" });
    }

    const { serviceId, time } = req.body;

    // Parse and validate ISO datetime
    const parsedTime = moment(time, moment.ISO_8601, true);
    if (!parsedTime.isValid()) {
      return res.status(400).json({ message: "Invalid ISO datetime format" });
    }

    const host = await HostModel.findById(hostId);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    const service = await ServicesModel.findById(serviceId).populate("vendor");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const newBooking = new BookingModel({
      service: service._id,
      host: host._id,
      vendor: service.vendor._id,
      date: parsedTime.toDate(), 
    });

    await newBooking.save();

    service.bookings.push(newBooking._id);
    await service.save();

    // Build and send email using template
    const emailTemplate = hostBookingTemplates(
      host.first_name,
      service.title,
      parsedTime.format("dddd, MMMM Do YYYY, h:mm A") // Example: "Tuesday, April 23rd 2025, 3:00 PM"
    );

    await SendEmail(res, host.email, emailTemplate);

    res.status(201).json({ message: "Service booked successfully." });

  } catch (error) {
    console.error("BuyService Error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
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

//!______________________ Single Venue _________________________________!
exports.SingleVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    const venue = await VenueModel.findById(venueId).populate("bookings");
    if (!venue) {
      return res.status(404).json({ message: "venue not exist" });
    }
    res.status(200).json({ message: "venue data found", venue });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "something went wrong please try again.Later", error });
  }
};
