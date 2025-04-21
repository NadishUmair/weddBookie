
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ServiceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  img:{
     type:[String]
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  category: {
    type: String, // e.g., 'Car Rental', 'Catering', 'Photography'
    required: true
  },
  status:{
     type:String,
     enum:["under-review","pending","active"],
     default:"under-review"
  }
}, { timestamps: true });

  const ServicesModel= mongoose.model('service', ServiceSchema);
  module.exports=ServicesModel;
  