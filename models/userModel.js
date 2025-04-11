// models/User.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
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
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
}, {timestamps: true});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;