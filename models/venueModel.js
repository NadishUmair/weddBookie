
const mongooes=require("mongoose");
const {Schema}=mongooes;
const VenueSchema= new Schema({
    vendor:{
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
      },
      image:{
         type:String,
         required:true
      },
     street: {
        type: String,
      },
      city:{
        type: String,
      },
      state:{
        type: String,
      },
      country: {
        type: String,
      },
      postal_code: {
        type: String,
      },
    services:{
        type:[string]
    },
    capacity:{
        type: Number,
        required: true
      },
    available_dates: [{
        type: Date
      }],
      bookings: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
      }],   
},{timestamps:true})

const VenueModel=mongooes.model("Venue",VenueSchema);
module.exports=VenueModel