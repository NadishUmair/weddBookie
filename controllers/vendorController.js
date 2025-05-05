const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const VendorModel = require("../models/vendorModel");
const validateTimings = require("../utils/venueUtils");
const ServicesModel = require("../models/serviceModel");
const BookingModel = require("../models/bookingModel");
const PackageModel = require("../models/packageModel");
const { signupOtpTemplate, forgetPasswordTempalate, resetPasswordTemplate, updatePasswordTemplate } = require("../utils/emailTemplates");
const SendEmail = require("../utils/nodemailer");
const generateServiceSlots = require("../helper/generateSlots");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

//!__________________ Profile Update __________________________!
exports.VendorSignup = async (req, res) => {
  const {
    first_name,
    last_name,
    company_name,
    category,
    country,
    email,
    phone_no,
    city,
    password,
    business_registration,
    business_license_number
  } = req.body;

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
    const existingUser = await VendorModel.findOne({ email: emailToLowerCase });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists. Please use another." });
    }

    const existPhoneNo = await VendorModel.findOne({ phone_no });
    if (existPhoneNo) {
      return res.status(409).json({ message: "Phone number already exists. Please use another." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ➕ Automatically determine vendor_type based on category
    const vendor_type = category.toLowerCase() === "venue" ? "venue" : "service";

    const newUser = new VendorModel({
      first_name,
      last_name,
      company_name,
      category,
      country,
      email: emailToLowerCase,
      phone_no,
      city,
      password: hashedPassword,
      business_registration,
      business_license_number,
      vendor_type, // ✅ Set vendor_type here
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


//!________________ Verify Singup _____________________!
exports.verifySignup = async (req, res) => {
  try {
    // console.log("req",req);
    const userId = req.userId;
    const { otp } = req.body;
    const user = await UserModel.findById(userId);
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

//!______________ Vendor Login __________________________!
exports.VendorLogin = async (req, res) => {
  const { auth, password } = req.body;
  try {
    let query;

    // Check if input is an email or a phone number
    if (!isNaN(auth)) {
      // It's a phone number (convert to number)
      query = { phone_no: Number(auth) };
    } else if (auth.includes('@')) {
      // It's an email
      query = { email: auth.toLowerCase() };
    } else {
      return res.status(400).json({ message: "Invalid email or phone number format" });
    }

    const user = await VendorModel.findOne(query);
    if (!user) return res.status(404).json({ message: "User does not exist" });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    // Fetch user profile
 
    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};


//!___________ Update Vendor Profile __________________________!
// exports.UpdateVendorProfile = async (req, res) => {
//   const vendorId = req.params.id; 
//   const {
//     company_name,
//     business_desc,
//     country,
//     city,
//     website,
//     social_links,
//     images,
//     faqs,
//     postal_code,
//     capacity,
//     services,
//     timings,
//   } = req.body;

//   try {
//     const updatedVendor = await VendorModel.findByIdAndUpdate(
//       vendorId,
//       {
//      $set: {
//     company_name,
//     business_desc,
//     country,
//     city,
//     website,
//     social_links,
//     images,
//     faqs,
//     services,
//     postal_code,
//     capacity,
//     services,
//     timings,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     res.status(200).json({
//       message: "Profile updated successfully",
//       data: updatedVendor,
//     });
//   } catch (err) {
//     console.error("Profile update error:", err);
//     res.status(500).json({ message: "Server error while updating profile" });
//   }
// };

// controllers/vendorController.js


// exports.UpdateVendorProfile = async (req, res) => {
//   const vendorId = req.params.id;
//    const vendor =await  VendorModel.findById(vendorId);
//    if(!vendor){
//     return res.status(404).json({message:"vendor not fouund"})
//    }
//   const {
//     company_name,
//     business_desc,
//     country,
//     city,
//     website,
//     social_links,
//     images,
//     postal_code,
//     capacity,
//     services,
//     addi_services,
//     timings_venue,
//     vendor_type,
//     timings_service_weekly,
//     unavailable_dates,
//   } = req.body;

//   try {
//     let updateData = {
//       company_name,
//       business_desc,
//       country,
//       city,
//       website,
//       social_links,
//       images,
//       postal_code,
//       capacity,
//       services,
//       addi_services,
//       vendor_type,
//       unavailable_dates,
//     };

//     if (vendor_type === "venue") {
//       updateData.timings_venue = timings_venue;
//       updateData.timings_service_weekly = undefined;
//     } else if (vendor_type === "service") {
//       updateData.timings_service_weekly = timings_service_weekly;
//       updateData.timings_venue = undefined;
//     }

//     const updatedVendor = await VendorModel.findByIdAndUpdate(
//       vendorId,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     res.status(200).json({
//       message: "Vendor profile updated successfully",
//       data: updatedVendor,
//     });
//   } catch (error) {
//     console.error("Error updating vendor:", error);
//     res.status(500).json({ message: "Server error while updating vendor" });
//   }
// };

exports.UpdateVendorProfile = async (req, res) => {
  const vendorId = req.params.id;
  const vendor = await VendorModel.findById(vendorId);
  
  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  const {
    company_name,
    business_desc,
    country,
    city,
    website,
    social_links,
    images,
    postal_code,
    capacity,
    services,
    addi_services,
    vendor_type,
    slot_duration, // New field for slot duration
    unavailable_dates,
    working_hours, // Working hours for the week (start time and end time)
  } = req.body;

  try {
    let updateData = {
      company_name,
      business_desc,
      country,
      city,
      website,
      social_links,
      images,
      postal_code,
      capacity,
      services,
      addi_services,
      vendor_type,
      unavailable_dates,
      slot_duration,
      working_hours
    };

    if (vendor_type === "service") {
      // Generate service slots based on working hours and slot duration
      const generatedSlots = generateServiceSlots(working_hours, slot_duration);
      updateData.timings_service_weekly = generatedSlots; // Save the generated slots
    }

    // Apply the update
    const updatedVendor = await VendorModel.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor profile updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Server error while updating vendor" });
  }
};



//!________________ Vendor forget Password ___________________________!
exports.VendorForgetPassword = async (req, res) => {
  const { auth } = req.body;
  try {
    let query;

    // Check if input is an email or a phone number
    if (!isNaN(auth)) {
      // It's a phone number (convert to number)
      query = { phone_no: Number(auth) };
    } else if (auth.includes('@')) {
      // It's an email
      query = { email: auth.toLowerCase() };
    } else {
      return res.status(400).json({ message: "Invalid email or phone number format" });
    }

    const user = await VendorModel.findOne(query);
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const otp = generateOtp();
    user.otp = otp;
    await user.save();
    const vendorForgetPasstoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const forgetPassTem= forgetPasswordTempalate(user.first_name,otp)
    await SendEmail(res, user.email,forgetPassTem);
    res
      .status(200)
      .json({ message: "otp sent to your email", vendorForgetPasstoken, otp });
  } catch (error) {
    console.log("error",error);
    res.status(500).json({ message: "please try again.Later" });
  }
};


// !________________________Verify Otp ___________________________!
exports.VendorVerifyOtp = async (req, res) => {
  try {
    // console.log("req",req);
    const userId = req.userId;
    const { otp } = req.body;
    const user = await VendorModel.findById(userId);
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
exports.VendorResetPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    const user = await VendorModel.findById(userId);
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
    user.otp=null;
    await user.save();
    const resetPassTemp=resetPasswordTemplate(user?.first_name)
    await SendEmail(res,user.email,resetPassTemp);
    res.status(200).json({ message: "password changed successfully" });
  } catch (error) {
    console.log("eror",error);
    return res.status(500).json({ message: "try again.Later" });
  }
};


//!______________ Vendor Update Password __________________________!
exports.VendorUpdatePassword=async(req,res)=>{
    try { 
           const id=req.params.id;
           const {currentPassword,newPassword}=req.body;
           const user=await VendorModel.findById(id);
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



//!_________________ Vendor Create Service _________________!
exports.CreateService = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await VendorModel.findById(userId);

    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Unauthorized or user not found." });
    }

    const { name, description, price, category } = req.body;

    // Create new service with correct vendor ID
    const newService = new ServicesModel({
      name,
      description,
      price,
      category,
      vendor: user._id, // <-- fix here
    });

    await newService.save();

    // Add to profile's services and save profile
    user.services.push(newService._id);
    await user.save(); // <-- save the profile, not the user

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
      const user = await VendorModel.findById(userId);
  
      if (!user || user.role !== "vendor") {
        return res.status(403).json({ message: "Unauthorized or user not found." });
      }
        const service=await ServicesModel.findById(serviceId);
        if(!service){
          return res.status(404).json({message:"service not exist"});
        }
        console.log("user",service.vendor);
        if(service.vendor.toString() !== user._id.toString()){
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


//!______________________ my bookings (vendor) _____________________!
exports.GetVendorBookings=async(req,res)=>{
  try {
        const vendorId=req.params.id;
        const bookings = await BookingModel.find({ vendor: vendorId })
        .populate({
          path: "host",
          select: "-password", // Exclude host password
        });
          if(!bookings){
            return res.status(404).json({message:"bookings not exist"});
          };
          return res.status(200).json({message:"bookings found",bookings})
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"please try again.Later"})
  }
}


//!___________________ My single booking (vendor) ___________________!
exports.VendorSingleBooking=async(req,res)=>{
  try {
         const bookingId=req.params.id;
         const booking=await BookingModel.findById(bookingId)   .populate({
          path: "host",
          select: "-password", // Exclude host password
        });
         if(!booking){
          return res.status(404).json({message:"booking not found"});
         }
       return res.status(200).json({message:"booking found",booking})
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"please try again.Later"})
  }
}


//!___________________ Create Package _____________________!
exports.CreatePackage=async(req,res)=>{
  try {
       const userId=req.params.id;
       const {name,price,discount,description,features,is_popular}=req.body;
       const vendor=await VendorModel.findById(userId);
       if(!vendor){
        return res.status(404).json({message:"vendor not found"})
       }
       const newPackage=new PackageModel({
        vendor:vendor._id,
        name,
        price,
        discount,
        description,
        features,
        is_popular: is_popular ?? true,
       })
       await newPackage.save();
       vendor.packages.push(newPackage._id);
       await vendor.save();
       return res.status(200).json({message:"package created",newPackage})
  } catch (error) {
    console.log("error",error);
  return res.status(500).json({message:"please try again.Later"})
  }
}

//!_______________ Get all packages _______________________!
exports.GetAllPackages = async (req, res) => {
  try {
    const userId = req.params.id;
    const vendor = await VendorModel.findById(userId).populate('packages');
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    return res.status(200).json({ packages: vendor.packages });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};


//!____________ Update Package ___________________________!
exports.UpdatePackage = async (req, res) => {
  try {
    const userId = req.params.id;
    const {packageId,...updateData} = req.body;

    const updatedPackage = await PackageModel.findByIdAndUpdate(
      packageId,
      updateData,
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({ message: "Package updated", updatedPackage });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};

//!_____________________ Delete Package ___________________!
exports.DeletePackage = async (req, res) => {
  try {
    const vendorId=req.params.id;
    const { packageId } = req.body;

    const deletedPackage = await PackageModel.findByIdAndDelete(packageId);
    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Remove from vendor's packages array
    await VendorModel.findByIdAndUpdate(vendorId, {
      $pull: { packages: packageId },
    });

    return res.status(200).json({ message: "Package deleted" });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ message: "Please try again later." });
  }
};



