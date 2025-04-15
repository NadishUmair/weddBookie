
const mongooes=require("mongoose");
const {Schema}=mongooes;
const VenueSchema= new Schema({
    vendor:{
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
      },
      title:{
       type:String,
       required:true
      },
      timings: {
        type: Map,
        of: {
          start: { type: String, required: true },
          end: { type: String, required: true }    
        }
      },      
      images:{
         type:[String]
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
        type:[String]
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
      status:{
         type:String,
         enum: ['pending','rejected','active'],
         default:"pending"
      }
},{timestamps:true})

const VenueModel=mongooes.model("Venue",VenueSchema);
module.exports=VenueModel