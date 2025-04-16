
const mongooes=new mongooes();
const ServiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  venue: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    default: null // Only set if service is tied to a venue
  },
  category: {
    type: String, // e.g., 'Car Rental', 'Catering', 'Photography'
    required: true
  }
}, { timestamps: true });

  const ServicesModel= mongoose.model('service', ServiceSchema);
  module.exports=ServicesModel;
  