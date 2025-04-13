// models/Vendor.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const VendorSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: String,
    phone_no: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    company_name: String,
    category: {
        type: String,
        required: true
    },
    business_registration: String,
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    services: [{
        type: Schema.Types.ObjectId,
        ref: 'Service'
    }],
    venues: [{
        type: Schema.Types.ObjectId,
        ref: 'Venue'
    }],
    portfolio_images: [String],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const VendorModel = mongoose.model('Vendor', VendorSchema);
module.exports = VendorModel;