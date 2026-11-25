import mongoose from "mongoose";
const subtopic=new mongoose.Schema({name:{type:String,required:true},description:String},{_id:true});
const topic=new mongoose.Schema({name:{type:String,required:true},description:String,courseCode:{type:String,trim:true},difficulty:{type:String,enum:["easy","medium","hard"],default:"medium"},estimatedHours:{type:Number,min:0,default:2},lectureCovered:{type:Boolean,default:false},predictedNext:{type:Boolean,default:false},objectives:[{type:String}],requiredSkills:[{type:String}],questionTypes:[{type:String}],subtopics:[subtopic]});
const schema=new mongoose.Schema({programme:{type:String,required:true},subject:{type:String,required:true},description:String,topics:[topic]},{timestamps:true});
schema.index({programme:1,subject:1},{unique:true});
export default mongoose.model("Syllabus",schema);
