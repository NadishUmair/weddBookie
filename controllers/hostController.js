


const HostModel = require("../models/hostModel");


// !___________________________ Host Profile _____________________________!
exports.HostProfile=async(req,res)=>{
  try {
       const id=req.params.id;
       const profile=await HostModel.findById(id);
       if(!profile){
         return res.status(404).json({message:"profile not exist"});
       }
       res.status(200).json({message:"user profile",profile})
  } catch (error) {
    console.log("error",error);
   return res.status(505).json({message:"please try again.Later"})
  }
}


