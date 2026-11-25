import mongoose from "mongoose";
const answer=new mongoose.Schema({question:{type:mongoose.Schema.Types.ObjectId,ref:"Question"},answer:String,correct:Boolean});
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},day:{type:String,required:true},questionIds:[{type:mongoose.Schema.Types.ObjectId,ref:"Question"}],generatedQuestions:[{topicId:String,subject:String,topic:String,text:String,options:[String],correctIndex:Number,explanation:String}],source:{type:String,default:"ai"},answers:[answer],score:{type:Number,min:0,default:0},submittedAt:Date},{timestamps:true});
schema.index({user:1,day:1},{unique:true});
export default mongoose.model("Assessment",schema);
