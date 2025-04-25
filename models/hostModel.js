const mongoose = require("mongoose");
const { Schema } = mongoose;

const HostSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: String,
  country: {
    type: String,
    required: true,
  },
  event_type: { type: String, required: true }, // e.g., Wedding, Birthday, etc.
  estimated_guests: { type: Number, required: true },
  event_budget: { type: Number, required: true },
  interested_vendors: [{ type: Schema.Types.ObjectId, ref: "Vendor" }],
});

const HostModel = mongoose.model("host", HostSchema);
module.exports = HostModel;
