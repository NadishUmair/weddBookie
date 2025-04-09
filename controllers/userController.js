const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const HostModel = require('../models/hostModel');
const VendorModel = require('../models/vendorModel');


// Signup Controller
const signup = async (req, res) => {
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
const login = async (req, res) => {
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
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRETE_KEY, { expiresIn: '1h' });

      // Return the user data along with profile data and token
      res.status(200).json({
          token,
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

// Reset Password Controller
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};



module.exports = { signup, login, resetPassword };
