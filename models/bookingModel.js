const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
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
    venue: {
      type: Schema.Types.ObjectId,
      ref: "venue",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "service",
      required: true,
    },
    event_date: {
      type: Date,
      required: true,
    },
    time_slot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
    },
    guests: {
      type: Number,
      required: true,
    },
    extra_services: [
      {
        name: { type: String },
        price: { type: Number }
      }
    ],    
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("booking", BookingSchema);
module.exports = BookingModel;
