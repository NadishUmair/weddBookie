const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");
const SendEmail = require("../utils/nodemailer");

// Signup Controller
exports.signup = async (req, res) => {
  const { email, password, role, profileData } = req.body;
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
    const emailToLowerCase=email.toLowerCase();
    const existingUser = await UserModel.findOne({ email: emailToLowerCase });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    // Create corresponding profile (Vendor/Host) based on role and profileModel
    let newProfile;
    if (role === "host") {
      newProfile = new HostModel({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_no: profileData.phone_no,
        country: profileData.country,
        event_type: profileData.event_type,
        estimated_guests: profileData.estimated_guests,
        event_budget: profileData.event_budget,
      });
   
    }

    if (role === "vendor") {
      newProfile = new VendorModel({
        first_name: profileData.first_name, // Vendor-specific field
        last_name: profileData.last_name, // Vendor-specific field
        phone_no: profileData.phone_no, // Vendor-specific field
        country: profileData.country, // Vendor-specific field
        category: profileData.category, // Vendor-specific field
        business_registration: profileData.business_registration, // Vendor-specific field
      });
     
    }
      const savedProfile=await newProfile.save();
      newUser.profile=savedProfile._id;
      await newUser.save();

    const request = {
      subject: "Welcome to Wed Bookie!",
      message: `Hi there!
    
    Welcome to Wed Bookie! 🎉 We're excited to have you on board.
    
    You can now log in and start exploring all the awesome features we offer. If you ever have any questions or need help, our support team is just an email away.
    
    Thanks for joining us!
    
    Cheers,  
    The Wed Bookie Team`
    };
    
    await SendEmail(res,email,request, profileData.first_name)
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailToLowerCase=email.toLowerCase();
    const user = await UserModel.findOne({ email:emailToLowerCase });
    if (!user) return res.status(404).json({ message: "User not exist" });

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    // Fetch user's profile based on their role
    let profile = null;
    if (user.role === "host") {
      profile = await HostModel.findOne({ user: user._id }).exec();
    } else if (user.role === "vendor") {
      profile = await VendorModel.findOne({ user: user._id }).exec();
    }

    // Generate a JWT token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return the user data along with profile data and token
    res.status(200).json({
      accessToken,
      user: {
        _id:user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Forget Password Controller
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = generateOtp();
    user.otp = otp;
    await user.save();
    const forgetPasstoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const request = {
      subject: "OTP",
      message: `Please enter this OTP in the application to proceed. Remember, this OTP is valid for a limited time only. 
                        If you did not request this OTP, please disregard this email or contact our support team for assistance.`,
    };

    await SendEmail(res, user.email, request, user.first_name, otp);
    res
      .status(200)
      .json({ message: "otp sent to your email", forgetPasstoken, otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// !________________________Verify Otp ___________________________!
exports.verifyOtp = async (req, res) => {
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

// !__________________ Reset Passsword _____________________!
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    const user = await UserModel.findById(userId);
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
    await user.save();
    res.status(200).json({ message: "password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "try again.Later" });
  }
};


//!_____________________ Update Password ___________________!
exports.updatePassword=async(req,res)=>{
    try { 
           const id=req.params.id;
           const {currentPassword,newPassword}=req.body;
           const user=await UserModel.findById(id);
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
          const request = {
            subject: "Your Password Has Been Updated",
            message: `Hi there,
          
          We wanted to let you know that your password was successfully updated. If you made this change, no further action is needed.
          
          If you didn’t update your password, please contact our support team immediately so we can secure your account.
          
          Stay safe!
          
          Cheers,  
          The Wed Bookie Team`
          };
          await SendEmail(res,user.email,request,user.first_name);
          res.status(200).json({message:"password updated Successfully"});
    } catch (error) {
      res.status(200).json({message:"password updated Successfully"});   
    }
}

