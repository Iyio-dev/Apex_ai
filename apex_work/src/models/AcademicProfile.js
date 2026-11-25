import mongoose from "mongoose";
const schema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,unique:true},programme:{type:String,default:"OAU JUPEB"},subjects:{type:[String],enum:["Mathematics","Physics","Chemistry","Biology"],default:["Mathematics","Physics","Chemistry","Biology"]},goal:{type:String,default:"Prepare for JUPEB examinations"},examDate:Date,weeklyHours:{type:Number,min:0,max:168,default:10},strengths:[String],weaknesses:[String]},{timestamps:true});
export default mongoose.model("AcademicProfile",schema);
