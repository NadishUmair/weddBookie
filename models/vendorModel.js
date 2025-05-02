// models/Vendor.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const VendorSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name:{
     type:String
    },
    country:{
      type:String,
      required:true
    },
    city: {
      type: String,
    },
  email: {
      type: String,
      required: true,
      unique: true
  },
  phone_no:{
      type:Number,
      required:true
  },
  role: {
    type: String,
    default:"vendor"
},
  password: {
      type: String,
      required: true
  },
    company_name: String,
    business_desc: String,
    category: {
      type: String,
      required: true,
    },
    memeber_type:{
      type:String,
      enum:["general","premium"],
      default:"general"
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
      enum: ["partnership", "llc", "corporation"],
    },
    website: {
      type:String,
    },
    social_links: [String],
    postal_code: {
      type: String,
    },
    otp:{
      type:Number
     },
    profile_verification: {
      type: String,
      enum: ["under_review", "rejected","verified"],
      default:"under_review"
    },
    email_verfied:{
      type:Boolean,
      defsult:false
    },
    payout_info: {
      stripe_account_id: {
        type: String, 
   
      },
      bank_last4: String, 
      bank_name: String,
      account_holder_name: String, 
      currency: {
        type: String,
        default: 'usd',
      },
    },
    timings: {
      type: Map,
      of: new Schema(
        {
          morning: {
            start: { type: String, required: false },
            end: { type: String, required: false },
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
          afternoon: {
            start: { type: String, required: false },
            end: { type: String, required: false },
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
          evening: {
            start: { type: String, required: false },
            end: { type: String, required: false },
            status: {
              type: String,
              enum: ["active", "disabled"],
              default: "active",
            },
          },
        },
        { _id: false }
      ),
    },
    extra_services: [
      {
        name: { type: String},
        description: { type: String },
        price: { type: Number},
        is_optional: { type: Boolean},
      },
    ],
    images: {
      type: [String],
    },
    street: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    capacity: {
      type: Number,    
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "booking",
      },
    ],
    packages:[{
      type: Schema.Types.ObjectId,
      ref:"package"
    }],
    lastLogin: Date,
  },

  { timestamps: true }
);

const VendorModel = mongoose.model("vendor", VendorSchema);
module.exports = VendorModel;
