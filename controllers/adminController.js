const AdminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminTwoFactorCodeTemplate } = require("../utils/emailTemplates");
const SendEmail = require("../utils/nodemailer");

exports.AdminSignUp = async (req, res) => {
  try {
    const { first_name, email, password, phone_no } = req.body;
    const emailToLowerCase = email.toLowerCase();
    const existAdmin = await AdminModel.findOne({
      $or: [{ email: emailToLowerCase }, { phone_no }],
    });
    if (existAdmin) {
      return res.status(400).json({
        message: "Admin with this email or phone number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminModel({
      first_name,
      email,
      phone_no,
      password: hashedPassword,
    });
    await newAdmin.save();
    return res.status(201).json({ message: "admin created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "please try again.Later" });
  }
};

//!___________ Admin Login ______________________!
exports.AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailToLowerCase = email.toLowerCase();
    const existAdmin = await AdminModel.findOne({ email: emailToLowerCase });
    if (!existAdmin) {
      return res.status(404).json({ message: "admin not found" });
    }
    const isValidPassword = await bcrypt.compare(password, existAdmin.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "password not matched" });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    existAdmin.twoFactorCode = code;
    existAdmin.twoFactorCodeExpires = expires;
    await existAdmin.save();
    const twoFactorTemplate = adminTwoFactorCodeTemplate(
      existAdmin.first_name,
      code
    );
    await SendEmail(res, existAdmin.email, twoFactorTemplate);
    return res
      .status(200)
      .json({ message: "code for authentication sent on your email " });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "please try again.Later" });
  }
};

//!_________________ 2 Factor  Authentication _________________!
exports.VerifyAdmin2FA = async (req, res) => {
  try {
    const { email, code } = req.body;
    const admin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.twoFactorCode || !admin.twoFactorCodeExpires) {
      return res.status(400).json({ message: "Invalid request" });
    }
    if (
      admin.twoFactorCode !== code ||
      admin.twoFactorCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired 2FA code" });
    }
    // Clear 2FA data
    admin.twoFactorCode = null;
    admin.twoFactorCodeExpires = null;
    await admin.save();
    const AdminAccessToken = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "2FA verification successful",
      AdminAccessToken,
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({ message: "Please try again later" });
  }
};
