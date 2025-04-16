// models/Vendor.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const VendorSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: String,
    phone_no: {
      type: String,
      required: true,
    },
    company_name: String,
    category: {
      type: String,
      required: true,
    },
    business_registration:{ 
      type:String,
      required:true
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "review",
      },
    ],
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "service",
      },
    ],
    venues: [
      {
        type: Schema.Types.ObjectId,
        ref: "venue",
      },
    ],
    portfolio_images: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    business_license_number:{
      type:String,
      reuired:true
    },
    business_type: {
      type: String,
      enum: ["sole proprietorship", "partnership", "llc", "corporation"],
    },
    tax_id_number: String,
    website: {
      type:String,
      required:true
    },
    social_links: [String],
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    postal_code: {
      type: String,
      required: true,
    },
    years_of_experience: Number,
    isVerified:{
      type: Boolean,
      default: false,
    },
    verfication: {
      type: String,
      enum: ["underreview", "verified", "rejected"],
      default:"underreview"
    },
  },
  { timestamps: true }
);

const VendorModel = mongoose.model("vendor", VendorSchema);
module.exports = VendorModel;
