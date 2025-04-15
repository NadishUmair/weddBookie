const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");
const SendEmail = require("../utils/nodemailer");
const { CreateHostProfile, CreateVendorProfile } = require("../utils/profileUtils");


const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
// Signup Controller
exports.signup = async (req, res) => {
  const { email, password, role,phone_no, profileData } = req.body;
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
      return res.status(400).json({ message: "email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      phone_no,
      role,
      isVerified: false,
    });

    // Create corresponding profile (Vendor/Host) based on role and profileModel
    if (role === "host") {
      newProfile = CreateHostProfile(profileData, phone_no);
    } else if (role === "vendor") {
      newProfile = CreateVendorProfile(profileData, phone_no);
      if (newProfile.error) {
        return res.status(400).json({ message: newProfile.error });
      }
    }
    
    
      const savedProfile=await newProfile.save();
      newUser.profile=savedProfile._id;
      await newUser.save();
     const otp=generateOtp();
     const request = {
      subject: "Welcome to Wed Bookie!",
      message: `Hi there!
    
    Welcome to Wed Bookie! 🎉 We're excited to have you on board.
    
    To get started, we've sent you a One-Time Password (OTP) to verify your account.
    
    Please enter this OTP in the app to complete your sign-up process.
    
    You can now log in and start exploring all the awesome features we offer. If you ever have any questions or need help, our support team is just an email away.
    
    Thanks for joining us!
    
    Cheers,  
    The Wed Bookie Team`
    };
    await SendEmail(res,email,request, profileData.first_name,otp)
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

//!__________________ Verify Signup ______________________________!
exports.verifySignup=async(req,res)=>{
  try {
         const {email,otp}=req.body;
         const emailToLowerCase=email.toLowerCase();
         const user=await UserModel.findOne({email:emailToLowerCase});
         if(!user){
          return res.status(404).json({message:"user not exist"})
         }
         if(user.otp !== otp){
          return res.status(401).json({message:"otp not matched"})
         }
         user.otp=null;
            // Fetch user's profile based on their role
    let profile = null;
    if (user.role === "host") {
      profile = await HostModel.findOne({ _id: user.profile }).exec();
    } else if (user.role === "vendor") {
      profile = await VendorModel.findOne({ _id: user.profile }).exec();
    }
        // Generate a JWT token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.status(200).json({
      message:"loged in Successfully",
      accessToken,
      user: {
        _id:user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile,
      },
    });
  } catch (error) {
    return res.status(500).jon({message:"please try again.Later"})
  }
}


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
      profile = await HostModel.findOne({ _id: user.profile }).exec();
    } else if (user.role === "vendor") {
      profile = await VendorModel.findOne({ _id: user.profile }).exec();
    }


    console.log("user",user);
    // Generate a JWT token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
   
    await user.save();
 
    
    // Return the user data along with profile data and token
    SendEmail(res,user.email,request,profile.first_name)
    res.status(200).json({
      message:"loged In Sucessfully",
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

