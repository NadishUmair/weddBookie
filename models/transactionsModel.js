const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "successful", "failed", "refunded"],
      default: "initiated",
    },
    payment_method: {
      type: String, // e.g. 'stripe', 'razorpay', 'cash'
    },
    payment_reference: {
      type: String, // e.g. Stripe ID or Razorpay order ID
    },
    paid_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("transaction", TransactionSchema);
