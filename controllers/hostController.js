const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const BookingModel = require("../models/bookingModel");
const UserModel = require("../models/userModel");
const ServicesModel = require("../models/serviceModel");
const HostModel = require("../models/hostModel");
const SendEmail = require("../utils/nodemailer");
const {
  hostBookingTemplates,
  vendorBookingTemplates,
  hostServicePurchaseTemplate,
  vendorServiceBookingTemplate,
  signupOtpTemplate,
  forgetPasswordTempalate,
  resetPasswordTemplate,
  updatePasswordTemplate,
} = require("../utils/emailTemplates");
const { getUTCFromLocal } = require("../utils/timeZone");
const VendorModel = require("../models/vendorModel");
const PackageModel = require("../models/packageModel");
const ReviewModel = require("../models/reviewsModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
//!_____________________ Host Signup ___________________!
exports.HostSignup = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    event_budget,
    event_type,
    estimated_guests,
    phone_no,
    country,
  } = req.body;
  // profileData will include specific fields like estimated_guests for hosts or category for vendors

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address", email });
    }
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      return res.status(400).json({
        error:
          "Password should be at least 8 characters long and contain at least one uppercase letter",
      });
    }
    const emailToLowerCase = email.toLowerCase();
    const existingUser = await HostModel.findOne({ email: emailToLowerCase });
    if (existingUser)
      return res
        .status(409)
        .json({ message: "email already exists please use another" });
    const existPhoneNo = await HostModel.findOne({ phone_no });
    if (existPhoneNo) {
      return res
        .status(409)
        .json({ message: "phone no already exist pleasse use another" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new HostModel({
      first_name,
      last_name,
      country,
      email,
      event_budget,
      event_type,
      estimated_guests,
      password: hashedPassword,
      phone_no,
      isVerified: false,
    });
    const otp = generateOtp();
    newUser.otp = otp;
    await newUser.save();
    const emailTemplate = signupOtpTemplate(newUser.email, otp);
    await SendEmail(res, email, emailTemplate);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

//!______________________ Host Login _________________________!
exports.HostLogin = async (req, res) => {
  const { auth, password } = req.body;
  try {
    let query;

    // Check if input is an email or a phone number
    if (!isNaN(auth)) {
      // It's a phone number (convert to number)
      query = { phone_no: Number(auth) };
    } else if (auth.includes("@")) {
      // It's an email
      query = { email: auth.toLowerCase() };
    } else {
      return res
        .status(400)
        .json({ message: "Invalid email or phone number format" });
    }

    const user = await HostModel.findOne(query);
    if (!user) return res.status(404).json({ message: "User does not exist" });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    // Fetch user profile

    // Generate JWT token
    const hostAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Logged in successfully",
      hostAccessToken,
      user,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

//!________________ Host forget Password ___________________________!
exports.HostForgetPassword = async (req, res) => {
  const { auth } = req.body;
  try {
    let query;

    // Check if input is an email or a phone number
    if (!isNaN(auth)) {
      // It's a phone number (convert to number)
      query = { phone_no: Number(auth) };
    } else if (auth.includes("@")) {
      // It's an email
      query = { email: auth.toLowerCase() };
    } else {
      return res
        .status(400)
        .json({ message: "Invalid email or phone number format" });
    }

    const user = await HostModel.findOne(query);
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const otp = generateOtp();
    user.otp = otp;
    await user.save();
    const hostForgetPasstoken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const forgetPassTem = forgetPasswordTempalate(user.first_name, otp);
    await SendEmail(res, user.email, forgetPassTem);
    res
      .status(200)
      .json({ message: "otp sent to your email", hostForgetPasstoken, otp });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "please try again.Later" });
  }
};

// !________________________Verify Otp ___________________________!
exports.HostVerifyOtp = async (req, res) => {
  try {
    // console.log("req",req);
    const userId = req.userId;
    const { otp } = req.body;
    const user = await HostModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not exist" });
    }
    console.log("user", user.otp);
    if (user.otp !== otp) {
      return res.status(404).json({ message: "otp not matched" });
    }
    user.otp = null;
    await user.save();
    res.status(200).json({ message: "otp matched" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "try again.Later" });
  }
};

//!___________________ Reset Password ___________________________________!
exports.HostResetPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    const user = await HostModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not exist" });
    }
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      return res.status(400).json({
        error:
          "Password should be at least 8 characters long and contain at least one uppercase letter",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.otp = null;
    await user.save();
    const resetPassTemp = resetPasswordTemplate(user?.first_name);
    await SendEmail(res, user.email, resetPassTemp);
    res.status(200).json({ message: "password changed successfully" });
  } catch (error) {
    console.log("eror", error);
    return res.status(500).json({ message: "try again.Later" });
  }
};

//!______________ Host Update Password __________________________!
exports.HostUpdatePassword=async(req,res)=>{
    try { 
           const id=req.params.id;
           const {currentPassword,newPassword}=req.body;
           const user=await HostModel.findById(id);
           if(!user){
            return res.status(404).json({message:"user not exsit"});
           }
           const matchPassword=await bcrypt.compare(currentPassword,user.password);
           if(!matchPassword){
            return res.status(404).json({message:"current password not matched"});
           }
           if (newPassword.length < 8 || !/[A-Z]/.test(newPassword)) {
            return res.status(400).json({
              error:
                "Password should be at least 8 characters long and contain at least one uppercase letter",
            });
          }
          const hashPassword=await bcrypt.hash(newPassword,10);
          user.password=hashPassword;
          await user.save();
         const updatePassTemp=updatePasswordTemplate(user.first_name);
          await SendEmail(res,user.email,updatePassTemp);
          res.status(200).json({message:"password updated Successfully"});
    } catch (error) {
      res.status(200).json({message:"password updated Successfully"});   
    }
}

//!__________________ Profile Update __________________________!
exports.HostCreateProfile = async (req, res) => {
  try {
    const { event_type, estimated_guests, event_budget } = req.body;

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
// exports.CreateVenueBooking = async (req, res) => {
//   try {
//     const hostId = req.params.id;
//     const host = await HostModel.findById(hostId);

//     if (!host || host.role !== "host") {
//       return res.status(403).json({ message: "Only hosts can create bookings." });
//     }

//     const {
//       vendorId,            // ✅ corrected from venueId to vendorId
//       event_date,
//       time_slot,
//       guests,
//       extra_services,
//       timezone,
//     } = req.body;

//     if (!event_date || !time_slot || !timezone || !vendorId) {
//       return res.status(400).json({
//         message: "vendorId, event_date, time_slot, and timezone are required.",
//       });
//     }

//     // Convert event date and time slot to UTC moment
//     const { utcMoment, error } = getUTCFromLocal(event_date, time_slot, timezone);
//     if (error) {
//       return res.status(400).json({ message: error });
//     }

//     // Get vendor (venue) and check category
//     const vendor = await VendorModel.findById(vendorId).select(
//       "category extra_services bookings name email first_name"
//     );

//     if (!vendor || vendor.category !== "venue") {
//       return res.status(404).json({ message: "Vendor not found or not a venue." });
//     }

//     // Check if already booked
//     const existingBooking = await BookingModel.findOne({
//       vendor: vendorId,
//       event_date: utcMoment,
//       time_slot,
//       status: { $ne: "rejected" },
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         message: "This venue is already booked for the selected date and time.",
//       });
//     }

//     // Validate extra services
//     let SelectedExtra = [];
//     if (extra_services?.length) {
//       SelectedExtra = extra_services.map((id) => {
//         const service = vendor.extra_services.find((s) => s._id.toString() === id);
//         if (!service) {
//           throw new Error("Invalid extra service selected");
//         }
//         return { name: service.name, price: service.price };
//       });
//     }

//     // Create and save booking
//     const booking = new BookingModel({
//       host: hostId,
//       vendor: vendorId,
//       venue: vendorId, // ✅ assuming vendor is also used as "venue"
//       event_date: utcMoment,
//       time_slot,
//       guests,
//       extra_services: SelectedExtra,
//       timezone,
//     });

//     await booking.save();

//     // Add booking to vendor document
//     vendor.bookings.push(booking._id);
//     await vendor.save();

//     // Send emails (host and vendor)
//     const formattedDate = utcMoment.format("dddd, MMMM Do YYYY, h:mm A");
//     const hostEmail = hostBookingTemplates(host.first_name, vendor.company_name, formattedDate);
//     const vendorEmail = vendorBookingTemplates(vendor.first_name, vendor.company_name, formattedDate, host.first_name);

//     await SendEmail(res, host.email, hostEmail);
//     await SendEmail(res, vendor.email, vendorEmail);

//     res.status(201).json({
//       message: "Booking request submitted. Awaiting vendor approval.",
//       booking,
//     });
//   } catch (error) {
//     console.error("Booking error:", error);
//     return res.status(500).json({ message: "Something went wrong." });
//   }
// };

// exports.CreateVenueBooking = async (req, res) => {
//   try {
//     const hostId = req.params.id;
//     const host = await HostModel.findById(hostId);
//     if (!host || host.role !== "host") {
//       return res
//         .status(403)
//         .json({ message: "Only hosts can create bookings." });
//     }

//     const {
//       packageId, // ✅ new field for package
//       event_date,
//       time_slot,
//       guests,
//       extra_services,
//       timezone,
//     } = req.body;

//     if (!event_date || !time_slot || !timezone) {
//       return res.status(400).json({
//         message: "vendorId, event_date, time_slot, and timezone are required.",
//       });
//     }

//     const { utcMoment, error } = getUTCFromLocal(
//       event_date,
//       time_slot,
//       timezone
//     );
//     if (error) {
//       return res.status(400).json({ message: error });
//     }
//     let selectedPackage = null;
//     if (packageId) {
//       selectedPackage = await PackageModel.findOne({
//         _id: packageId,
//       });

//       if (!selectedPackage) {
//         return res.status(404).json({ message: "Selected package not found" });
//       }
//     }

//     const vendor = await VendorModel.findById(selectedPackage.vendor).select(
//       "category extra_services bookings company_name email first_name"
//     );

//     if (!vendor || vendor.category !== "venue") {
//       return res
//         .status(404)
//         .json({ message: "Vendor not found or not a venue." });
//     }

//     const existingBooking = await BookingModel.findOne({
//       vendor: vendor._id,
//       event_date: utcMoment,
//       time_slot,
//       status: { $ne: "rejected" },
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         message:
//           "This vendor is already booked for the selected date and time.",
//       });
//     }

//     // ✅ Fetch package details if provided

//     // Validate extra services
//     let SelectedExtra = [];
//     if (extra_services?.length) {
//       SelectedExtra = extra_services.map((id) => {
//         const service = vendor.extra_services.find(
//           (s) => s._id.toString() === id
//         );
//         if (!service) {
//           throw new Error("Invalid extra service selected");
//         }
//         return { name: service.name, price: service.price };
//       });
//     }

//     // Create booking with package reference
//     const booking = new BookingModel({
//       host: hostId,
//       vendor: vendor._id,
//       venue: vendor._id,
//       package: packageId,
//       event_date: utcMoment,
//       time_slot,
//       guests,
//       extra_services: SelectedExtra,
//       timezone,
//     });

//     await booking.save();
//     vendor.bookings.push(booking._id);
//     await vendor.save();

//     const formattedDate = utcMoment.format("dddd, MMMM Do YYYY, h:mm A");
//     const hostEmail = hostBookingTemplates(
//       host.first_name,
//       vendor.company_name,
//       formattedDate
//     );
//     const vendorEmail = vendorBookingTemplates(
//       vendor.first_name,
//       vendor.company_name,
//       formattedDate,
//       host.first_name
//     );

//     await SendEmail(res, host.email, hostEmail);
//     await SendEmail(res, vendor.email, vendorEmail);

//     res.status(201).json({
//       message: "Booking request submitted. Awaiting vendor approval.",
//       booking,
//     });
//   } catch (error) {
//     console.error("Booking error:", error);
//     res.status(500).json({ message: "Something went wrong." });
//   }
// };

exports.CreateVendorBooking = async (req, res) => {
  try {
    const hostId = req.params.id;
    const host = await HostModel.findById(hostId);
    if (!host || host.role !== "host") {
      return res.status(403).json({ message: "Only hosts can create bookings." });
    }

    const {
      packageId,
      event_date,
      time_slot,         // still needed for venues
      guests,
      extra_services,
      timezone,
      start_time,        // for non-venue vendors
      end_time,          // for non-venue vendors
    } = req.body;

    if (!event_date || !timezone || !packageId) {
      return res.status(400).json({ message: "packageId, event_date, and timezone are required." });
    }

    const selectedPackage = await PackageModel.findById(packageId);
    if (!selectedPackage) return res.status(404).json({ message: "Package not found" });

    const vendor = await VendorModel.findById(selectedPackage.vendor).select("category extra_services bookings company_name email first_name");

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    let utcStartTime = null;
    let utcEndTime = null;
    let utcMoment = null;

    // Handle venue vs non-venue
    if (vendor.category === "venue") {
      if (!time_slot) {
        return res.status(400).json({ message: "time_slot is required for venue bookings." });
      }

      const { utcMoment: venueUtcMoment, error } = getUTCFromLocal(event_date, time_slot, timezone);
      if (error) return res.status(400).json({ message: error });
      utcMoment = venueUtcMoment;

      // Check venue availability
      const existingBooking = await BookingModel.findOne({
        vendor: vendor._id,
        event_date: utcMoment,
        time_slot,
        status: { $ne: "rejected" },
      });

      if (existingBooking) {
        return res.status(409).json({ message: "This venue is already booked for the selected date and time." });
      }
    } else {
      // Non-venue service: convert start and end time
      if (!start_time || !end_time) {
        return res.status(400).json({ message: "start_time and end_time are required for non-venue bookings." });
      }

      const moment = require("moment-timezone");
      const localStart = moment.tz(`${event_date} ${start_time}`, "YYYY-MM-DD hh:mm A", timezone);
      const localEnd = moment.tz(`${event_date} ${end_time}`, "YYYY-MM-DD hh:mm A", timezone);

      if (!localStart.isValid() || !localEnd.isValid() || localEnd.isBefore(localStart)) {
        return res.status(400).json({ message: "Invalid start or end time." });
      }

      utcStartTime = localStart.clone().utc();
      utcEndTime = localEnd.clone().utc();

      // Optional: Check for overlapping bookings
      const overlapping = await BookingModel.findOne({
        vendor: vendor._id,
        event_date: { $eq: utcStartTime.clone().startOf("day") },
        $or: [
          {
            start_time: { $lt: utcEndTime },
            end_time: { $gt: utcStartTime },
          }
        ],
        status: { $ne: "rejected" },
      });

      if (overlapping) {
        return res.status(409).json({ message: "This vendor is already booked for the selected time range." });
      }
    }

    // Validate extra services
    let SelectedExtra = [];
    if (extra_services?.length) {
      SelectedExtra = extra_services.map((id) => {
        const service = vendor.extra_services.find((s) => s._id.toString() === id);
        if (!service) throw new Error("Invalid extra service selected");
        return { name: service.name, price: service.price };
      });
    }

    // Create booking
    const booking = new BookingModel({
      host: hostId,
      vendor: vendor._id,
      venue: vendor.category === "venue" ? vendor._id : null,
      package: packageId,
      event_date: vendor.category === "venue" ? utcMoment : utcStartTime.clone().startOf("day"),
      time_slot: vendor.category === "venue" ? time_slot : null,
      start_time: vendor.category !== "venue" ? utcStartTime : null,
      end_time: vendor.category !== "venue" ? utcEndTime : null,
      guests,
      extra_services: SelectedExtra,
      timezone,
      duration: selectedPackage.duration,
    });

    await booking.save();

    vendor.bookings.push(booking._id);
    await vendor.save();

    // const formattedTime = vendor.category === "venue"
    //   ? utcMoment.format("dddd, MMMM Do YYYY, h:mm A")
    //   : `${utcStartTime.format("h:mm A")} to ${utcEndTime.format("h:mm A")} on ${utcStartTime.format("dddd, MMMM Do YYYY")}`;

    

const formattedTime = vendor.category === "venue"
  ? moment.utc(utcMoment).tz(timezone).format("dddd, MMMM Do YYYY, h:mm A")
  : `${moment.utc(utcStartTime).tz(timezone).format("h:mm A")} to ${moment.utc(utcEndTime).tz(timezone).format("h:mm A")} on ${moment.utc(utcStartTime).tz(timezone).format("dddd, MMMM Do YYYY")}`;

    const hostEmail = hostBookingTemplates(host.first_name, vendor.company_name, formattedTime);
    const vendorEmail = vendorBookingTemplates(vendor.first_name, vendor.company_name, formattedTime, host.first_name);

    await SendEmail(res, host.email, hostEmail);
    await SendEmail(res, vendor.email, vendorEmail);

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
exports.SingleVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const venue = await VendorModel.findById(vendorId).populate({
      path:"reviews",
      populate:{
        path:'host',
        select:"first_name last_name"
      }
    });
    if (!venue) {
      return res.status(404).json({ message: "venue not found" });
    }
    return res.status(200).json({ message: "venue", venue });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "plase try again.Later" });
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
    const host = await HostModel.findById(hostId);

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

    const service = await ServicesModel.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const vendor = await VendorModel.findOne({ _id: service.vendor });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Create the booking with the UTC date
    const newBooking = new BookingModel({
      service: service._id,
      host: host._id,
      vendor: service.vendor,
      event_date: utcMoment.toDate(), // Save the UTC time to the database
    });

    await newBooking.save();

    // Push the new booking ID to the service's bookings array
    service.bookings.push(newBooking._id);
    await service.save();

    const hostServiceTemplate = hostServicePurchaseTemplate(
      host.first_name,
      service.name,
      utcMoment.format("dddd, MMMM Do YYYY, h:mm A"), // Format the UTC time
      service.price
    );

    const vendorServiceTemplate = vendorServiceBookingTemplate(
      vendor.$clonefirst_name,
      service.name,
      utcMoment.format("dddd, MMMM Do YYYY, h:mm A"), // Format the UTC time
      host.first_name,
      service.price
    );

    await SendEmail(res, host.email, hostServiceTemplate);
    await SendEmail(res, vendor.email, vendorServiceTemplate);

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

//!__________________ Get All My Bookings (Host) ____________________________!
exports.GetAllMyBookings = async (req, res) => {
  try {
    const hostId = req.params.id;
    const bookings = await BookingModel.find({ host: hostId }).populate(
      "vendor",
      "first_name last_name company_name email"
    );

    if (!bookings) {
      return res.status(404).json({ message: "not any booking exist" });
    }
    return res.status(200).json({ message: "found bookings", bookings });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ mesage: "please try again.Later" });
  }
};

//!__________________ Get My Single Booking (Host) __________________________!
exports.HostBookingDetail = async (req, res) => {
  try {
    const hostId = req.params.id;
    const { bookingId } = req.body;
    const host = await HostModel.findById(hostId);
    if (!host || host.role !== "host") {
      return res
        .status(403)
        .json({ message: "Only host can access this bookings." });
    }
    const booking = await BookingModel.findById(bookingId)
      .populate("vendor")
      .populate("vendor", "first_name last_name company_name email");
    if (!booking) {
      return res.status(404).json({ message: "booking not found" });
    }
    return res.status(200).json({ message: "booking found", booking });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "please try again.Later" });
  }
};



//!________________ All Vendors on the category base ________________________!
exports.GetAllVendors = async (req, res) => {
  try {
    const { category } = req.query;
    console.log("category",category);
    let vendors;
    if (category) {
      vendors = await VendorModel.find({ category }).select('-password');
    } else {
      vendors = await VendorModel.find().select('-password');
    }
    return res.status(200).json({ vendors });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};



//!___________________________ Review a Vendor _____________________!
exports.GiveReview = async (req, res) => {
  try {
    const hostId = req.params.id; 
    const { vendorId, reviewText, rating } = req.body;

    // Validate host
    const host = await HostModel.findById(hostId);
    if (!host) {
      return res.status(404).json({ message: "Host does not exist" });
    }

    // Validate vendor
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor does not exist" });
    }

    // Check if host has an accepted booking with this vendor
    const hasBooking = await BookingModel.exists({
      vendor: vendorId,
      host: hostId,
      status: "accepted",
    });

    if (!hasBooking) {
      return res.status(403).json({ message: "You cannot review this vendor without a confirmed booking." });
    }

    // Prevent duplicate reviews from same host for same vendor
    const alreadyReviewed = await ReviewModel.findOne({
      host: hostId,
      vendor: vendorId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this vendor." });
    }

    // Save review
    const newReview = new ReviewModel({
      host: hostId,
      vendor: vendorId,
      text: reviewText,
      rating,
    });

    await newReview.save();

    // Add review ID to vendor's reviews
    vendor.reviews.push(newReview._id);
    await vendor.save();

    return res.status(201).json({ message: "Review submitted successfully", review: newReview });

  } catch (error) {
    console.error("Review error:", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};

