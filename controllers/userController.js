const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const HostModel = require('../models/hostModel');
const VendorModel = require('../models/vendorModel');
const SendEmail = require('../utils/nodemailer');


// Signup Controller
exports.signup = async (req, res) => {
    const { email, password, role, profileData } = req.body;
    // profileData will include specific fields like estimated_guests for hosts or category for vendors

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ error: "Invalid email address", email});
      }
      if (password.length < 8 || !/[A-Z]/.test(password)) {
        return res.status(400).json({
          error:
            "Password should be at least 8 characters long and contain at least one uppercase letter",
        });
      }
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            email,
            password: hashedPassword,
            role,
            isVerified: false,
        });

        await newUser.save();

        // Create corresponding profile (Vendor/Host) based on role and profileModel
        if (role === 'host') {
            const newHost = new HostModel({
                user: newUser._id,
                first_name: profileData.first_name, 
                last_name: profileData.last_name,  
                phone_no: profileData.phone_no,  
                country: profileData.country,
                event_type: profileData.event_type, 
                estimated_guests: profileData.estimated_guests,  
                event_budget: profileData.event_budget, 
            });
            await newHost.save();
        }

        if (role === 'vendor') {
            const newVendor = new VendorModel({
                user: newUser._id,
                first_name: profileData.first_name,  // Vendor-specific field
                last_name: profileData.last_name,  // Vendor-specific field
                phone_no: profileData.phone_no,  // Vendor-specific field
                country: profileData.country,  // Vendor-specific field
                category: profileData.category,  // Vendor-specific field
                business_registration: profileData.business_registration,  // Vendor-specific field
            });
            await newVendor.save();
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

      // Fetch user's profile based on their role
      let profile = null;
      if (user.role === 'host') {
          profile = await HostModel.findOne({ user: user._id }).exec();
      } else if (user.role === 'vendor') {
          profile = await VendorModel.findOne({ user: user._id }).exec();
      }

      // Generate a JWT token
      const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Return the user data along with profile data and token
      res.status(200).json({
          accessToken,
          user: {
              email: user.email,
              role: user.role,
              isVerified: user.isVerified,
              profile, 
          }
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error logging in' });
  }
};

// Forget Password Controller
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
}
exports.forgetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const otp=generateOtp()
        user.otp=otp;
        await user.save();
        const forgetPasstoken=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn: '1h'});
        const request=  
            {
                subject: "OTP",
                message: `Please enter this OTP in the application to proceed. Remember, this OTP is valid for a limited time only. 
                        If you did not request this OTP, please disregard this email or contact our support team for assistance.`,
              }
        
        await SendEmail(res,user.email,request,user.first_name,otp);
        res.status(200).json({ message: 'otp sent to your email', forgetPasstoken ,otp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};


//Verify Otp

exports.verifyOtp=async(req,res)=>{
    try {
        // console.log("req",req);
        const userId=req.userId;
        console.log("id",userId);
        const {otp}=req.body;
        console.log("otp",otp);
        const user=await UserModel.findById(userId);
        if(!user){
            return res.status(404).json({message:"user not exist"})
        }
        console.log("user",user.otp);
        if(user.otp !== otp){
            return res.status(404).json({message:"otp not matched"})
        }
        user.otp=null;
        await user.save();
        res.status(200).json({message:"otp matched"})
    } catch (error) {
        console.log("error",error);
        return res.status(500).json({message:"try again.Later"})
    }
}


// !__________________ Reset Passsword _____________________!
exports.resetPassword=async(req,res)=>{
    try {
         const userId=req.userId;
         const {password}=req.body;
         const user=await UserModel.findById(userId);
          if(!user){
            return res.status(404).json({message:"user not exist"});
          }
          if (password.length < 8 || !/[A-Z]/.test(password)) {
            return res.status(400).json({
              error:
                "Password should be at least 8 characters long and contain at least one uppercase letter",
            });
          }
          const hashPassword=await bcrypt.hash(password,10);
          user.password=hashPassword;
          await user.save();
          res.status(200).json({message:"password changed successfully"});  
        } catch (error) {
         return res.status(500).json({message:"try again.Later"})
       }
}









