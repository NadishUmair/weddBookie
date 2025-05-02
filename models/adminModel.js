const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema = new Schema({
  first_name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:{type:String,default:'admin'},
  twoFactorCode: Number,
  twoFactorCodeExpires: Date,
});

const AdminModel = mongoose.model("admin", AdminSchema);
module.exports = AdminModel;
