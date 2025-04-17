
const mongooes=require("mongoose");
const {Schema}=mongooes;
const VenueSchema= new Schema({
    vendor:{
        type: Schema.Types.ObjectId,
        ref: 'vendor',
        required: true
      },
      title:{
       type:String,
       required:true
      },
      timings: {
        type: Map,
        of: new Schema({
          morning: {
            start: { type: String, required: false },
            end: { type: String, required: false }
          },
          afternoon: {
            start: { type: String, required: false },
            end: { type: String, required: false }
          },
          evening: {
            start: { type: String, required: false },
            end: { type: String, required: false }
          }
        }, { _id: false })
      },   
      extra_services: [
        {
          name: { type: String, required: true },
          description: { type: String },
          price: { type: Number, required: true },
          is_optional: { type: Boolean, default: true }
        }
      ],
           
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
        ref: 'booking'
      }],
      status:{
         type:String,
         enum: ['pending','rejected','active'],
         default:"pending"
      }
},{timestamps:true})

const VenueModel=mongooes.model("venue",VenueSchema);
module.exports=VenueModel;