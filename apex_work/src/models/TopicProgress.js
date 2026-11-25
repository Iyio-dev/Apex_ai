import mongoose from "mongoose";
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},topic:{type:mongoose.Schema.Types.ObjectId,required:true},subject:{type:String,required:true},lectureCovered:{type:Boolean,default:false},understanding:{type:Number,min:0,max:5,default:0}},{timestamps:true});
schema.index({user:1,topic:1},{unique:true});
export default mongoose.model("TopicProgress",schema);
