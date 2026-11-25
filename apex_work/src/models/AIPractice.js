import mongoose from "mongoose";
const item=new mongoose.Schema({text:{type:String,required:true},options:{type:[String],required:true},correctIndex:{type:Number,required:true,min:0,max:3},explanation:String,objective:String,topicId:{type:mongoose.Schema.Types.ObjectId,required:true}},{_id:true});
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},plan:{type:mongoose.Schema.Types.ObjectId,ref:"StudyPlan",required:true},activity:{type:mongoose.Schema.Types.ObjectId},mode:{type:String,enum:["objective","revision"],required:true},questions:[item],answers:[Number],score:Number,submittedAt:Date},{timestamps:true});
schema.index({user:1,createdAt:-1});
export default mongoose.model("AIPractice",schema);
