import mongoose from 'mongoose';
const item = new mongoose.Schema({action:{type:String,required:true},reason:{type:String,required:true},firstStep:{type:String,required:true},evidence:{type:String,required:true}},{_id:false});
const schema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},answers:{type:Map,of:String,required:true},contextSnapshot:{type:mongoose.Schema.Types.Mixed,required:true},overview:{summary:{type:String,required:true},start:[item],stop:[item],reduce:[item],reinforce:[item]},version:{type:Number,default:1}},{timestamps:true});
export default mongoose.model('AcademicOverview',schema);
