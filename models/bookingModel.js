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
    message: {
      type: String,
    },
    response_message: {
      type: String,
    },
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
