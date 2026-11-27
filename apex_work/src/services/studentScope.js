import {coveredScope} from "./curriculumScope.js";
import AcademicProfile from "../models/AcademicProfile.js";
import {findStudentSyllabuses} from "./syllabusLookupService.js";
import AppError from "../utils/AppError.js";
export async function studentScope(user){
 const profile=await AcademicProfile.findOne({user}).lean();
 return {profile,...coveredScope(profile ? await findStudentSyllabuses(profile) : [])};
}
export {inScope,scopedPlan,scopedAssessment} from "./scopeFilters.js";
export function requireTopic(scope,id,subject){if(!scope.topics.has(String(id))||(subject!==undefined&&scope.topics.get(String(id))!==subject))throw new AppError("Topic is outside your academic profile",403);}
