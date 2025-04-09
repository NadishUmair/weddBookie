
const mongooes=new mongooes();
const serviceSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    price:{
      type: Number,
      required: true
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    available: {
      type: Boolean,
      default: true
    }
  }, { timestamps: true });
  
  const ServicesModel= mongoose.model('Service', serviceSchema);
  module.exports=ServicesModel;
  