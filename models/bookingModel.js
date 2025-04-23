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
    // Only required for venue booking
    venue: {
      type: Schema.Types.ObjectId,
      ref: "venue",
      default: null,
    },
    // Only required for service booking
    service: {
      type: Schema.Types.ObjectId,
      ref: "service",
      default: null,
    },
    date: {
      type: Date,
    },
    // Only relevant for venue bookings
    time_slot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      default: null,
    },
    // Optional depending on booking type
    guests: {
      type: Number,
      default: null,
    },
    // Optional, only for venue bookings with extra services
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
