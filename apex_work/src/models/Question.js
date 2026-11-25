import mongoose from "mongoose";
const schema=new mongoose.Schema({subject:{type:String,required:true},topic:{type:mongoose.Schema.Types.ObjectId,required:true},text:{type:String,required:true},options:[String],correctAnswer:{type:String,required:true,select:false},explanation:{type:String,default:"",select:false},difficulty:{type:String,enum:["easy","medium","hard"],default:"medium"}},{timestamps:true});
export default mongoose.model("Question",schema);
