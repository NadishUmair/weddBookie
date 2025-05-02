// models/User.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true,
      },
      last_name:{
       type:String
      },
      country:{
        type:String,
        required:true
      },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone_no:{
        type:Number,
        required:true
    },
    country: {
        type: String,
        required: true,
      },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['vendor', 'host', 'admin'],
        required: true
    },
    otp:{
     type:Number
    },
    profile: {
        type: Schema.Types.ObjectId,
        refPath: 'role',
      },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
}, {timestamps: true});

const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;