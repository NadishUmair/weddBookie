// models/Vendor.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Main vendor schema
const VendorSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    phone_no: { type: Number, required: true },
    country: { type: String, required: true },
    city: { type: String },
    role: { type: String, default: "vendor" },
    password: { type: String, required: true },
    company_name: String,
    business_desc: String,
    category: { type: String, required: true },
    memeber_type: {
      type: String,
      enum: ["general", "premium"],
      default: "general",
    },
    business_registration: { type: String, required: true },
    business_license_number: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "review" }],
    isFeatured: { type: Boolean, default: false },
    business_type: {
      type: String,
      enum: ["partnership", "llc", "corporation"],
    },
    website: String,
    social_links: [String],
    postal_code: String,
    otp: { type: Number },
    profile_verification: {
      type: String,
      enum: ["under_review", "rejected", "verified"],
      default: "under_review",
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    payout_info: {
      stripe_account_id: String,
      bank_last4: String,
      bank_name: String,
      account_holder_name: String,
      currency: { type: String, default: "usd" },
    },

    // ➕ New fields for vendor type and availability
    vendor_type: {
      type: String,
      enum: ["venue", "service"],
      required: true,
    },

    timings_venue: {
      type: Object,
      of: new Schema(
        {
          morning: {
            start: String,
            end: String,
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
          afternoon: {
            start: String,
            end: String,
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
          evening: {
            start: String,
            end: String,
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
        },
        { _id: false }
      ),
      default: undefined,
    },
    slot_duration: { 
      type: Number,
      required: true,
    },
    working_hours: {
      type: Map,
      of: new Schema(
        {
          start: String,
          end: String
        },
        { _id: false }
      ),
      default: undefined,
    },    
    timings_service_weekly: {
      type: Map,
      of: [
        new Schema(
          {
            start: String,
            end: String,
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
          { _id: false }
        ),
      ],
      default: undefined,
    },

    unavailable_dates: [String],

    services: [
      {
        name: String,
        description: String,
        price: Number,
        is_optional: Boolean,
      },
    ],
    addi_services: [
      {
        name: String,
        description: String,
        price: Number,
        is_optional: Boolean,
      },
    ],
    images: [String],
    street: String,
    capacity: Number,
    bookings: [{ type: Schema.Types.ObjectId, ref: "booking" }],
    packages: [{ type: Schema.Types.ObjectId, ref: "package" }],
    lastLogin: Date,
  },
  { timestamps: true }
);

const VendorModel = mongoose.model("vendor", VendorSchema);
module.exports = VendorModel;
