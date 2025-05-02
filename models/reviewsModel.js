const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  host: {
    type: Schema.Types.ObjectId,
    ref: "host",
    required: true,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "vendor",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
}, { timestamps: true });

const ReviewModel= mongoose.model('review',ReviewSchema);
module.exports=ReviewModel;
