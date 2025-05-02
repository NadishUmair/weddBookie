const mongoose = require("mongoose");
const { Schema } = mongoose;

const HostSchema = new Schema({
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
email: {
    type: String,
    required: true,
    unique: true
},
linked_email:{
   type:String,
},
phone_no:{
    type:Number,
    required:true
},
country: {
    type: String,
    required: true,
  },
password: {
    type: String,
    required: true
},
role: {
  type: String,
  default:"host"
},
otp:{
 type:Number
},
profile: {
    type: Schema.Types.ObjectId,
    refPath: 'role',
  },
isVerified: {
    type: Boolean,
    default: false
},

  event_type: { type: String, required: true }, // e.g., Wedding, Birthday, etc.
  estimated_guests: { type: Number, required: true },
  event_budget: { type: Number, required: true },
  interested_vendors: [{ type: Schema.Types.ObjectId, ref: "Vendor" }],
  lastLogin: Date,
});

const HostModel = mongoose.model("host", HostSchema);
module.exports = HostModel;
