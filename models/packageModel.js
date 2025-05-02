const mongoose = require("mongoose");
const {Schema}=mongoose;

const PackageSchema=new Schema({
    vendor:{
        type: Schema.Types.ObjectId,
        ref:"vendor"
    },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        default:0
    },
    discount:{
        type:Number,
        defaul:0
    },
    description:{
        type:String,
    },
    features:{
      type:[String]
    },
    is_popular:{
      type:Boolean,
      default:true
    }
})

const PackageModel= mongoose.model('package',PackageSchema);
module.exports=PackageModel;