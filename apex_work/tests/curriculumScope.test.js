import test from 'node:test';
import assert from 'node:assert/strict';
import {coveredScope, coveredProfileTopics} from '../src/services/curriculumScope.js';
import {scopedPlan,scopedAssessment} from '../src/services/scopeFilters.js';
test('covered scope preserves objectives and excludes uncovered topics from plans and assessments',()=>{
 const scope=coveredScope([{subject:'Mathematics',topics:[{_id:'a',lectureCovered:true,objectives:['Solve equations']},{_id:'b',lectureCovered:false}]}]);
 assert.deepEqual([...scope.topics.keys()],['a']);
 assert.deepEqual(scope.records[0].topics[0].objectives,['Solve equations']);
 assert.equal(scopedPlan(scope,{activities:[{topic:'a',subject:'Mathematics'},{topic:'b',subject:'Mathematics'}]}).activities.length,1);
 assert.equal(scopedAssessment(scope,{generatedQuestions:[{topicId:'b',subject:'Mathematics'}]}),false);
});

test('profile ratings exclude uncovered and unrelated topic names',()=>{
 const records=[{subject:'Physics',topics:[{name:'Vectors',lectureCovered:true},{name:'Waves',lectureCovered:false},{name:'Optics'}]}];
 assert.deepEqual(coveredProfileTopics(records,['Vectors','Waves','Optics','Calculus']),['Vectors']);
});
