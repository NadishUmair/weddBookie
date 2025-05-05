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
      ref: "vendor", // typically same as vendor for venue-type
      default: null,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "package",
      default: null,
    },
    // Expanded service info for invoice or display
    extra_services: [
      {
        name: String,
        price: Number,
      },
    ],
    event_date: Date,
    timezone: String,
    time_slot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      default: null,
    },
    guests: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    start_time: Date,
    end_time: Date,
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
