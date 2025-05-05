// models/Message.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel'
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['host', 'vendor']
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel'
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['host', 'vendor']
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("message", MessageSchema);
module.exports = MessageModel;
