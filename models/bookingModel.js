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
    event_date: {
      type: Date,
    },
    timezone: {
      type: String,
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
    package: {
      type: Schema.Types.ObjectId,
      ref: "package",
    },
    // Optional, only for venue bookings with extra services
    extra_services: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected","cancelled"],
      default: "pending",
    },
    start_time: { type: Date },
    end_time: { type: Date },
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
