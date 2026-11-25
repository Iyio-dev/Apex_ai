import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeQuestions} from '../src/services/aiPracticeService.js';
import {publicDaily,selectDailyTopics} from '../src/services/dailyAssessmentService.js';

const topics=[{topicId:'biology'},{topicId:'maths'}];
const question={text:'Which expression is a derivative?',options:['A','B','C','D'],correctIndex:0,explanation:'Example',topicId:'maths'};
test('questions retain their supplied syllabus association in provider order',()=>{
 const result=normalizeQuestions(JSON.stringify([question,{...question,text:'Which stage is part of mitosis?',topicId:'biology'}]),2,topics);
 assert.deepEqual(result.map(q=>q.topicId),['maths','biology']);
});
test('questions must reference an available topic',()=>{
 assert.throws(()=>normalizeQuestions(JSON.stringify([{...question,topicId:'unlisted'}]),1,topics));
});
test('daily topic priority reflects lecturer coverage without a student progress entry',()=>{
 const selected=selectDailyTopics({profile:{},plans:[],progress:[],syllabuses:[{subject:'Biology',topics:[{_id:'1',name:'Genetics'},{_id:'2',name:'Mitosis',lectureCovered:true}]}]});
 assert.equal(selected[0].topic,'Mitosis');
});

test('daily assessment response exposes the correct denominator without answer keys',()=>{
 const generatedQuestions=Array.from({length:10},(_,i)=>({subject:'Math',topic:`Topic ${i}`,text:`Question ${i}`,options:['A','B','C','D'],correctIndex:2,explanation:'Private explanation'}));
 const response=publicDaily({day:'2026-11-24',submittedAt:new Date(),score:8,generatedQuestions});
 assert.equal(response.total,10);
 assert.equal(response.score,8);
 assert.deepEqual(response.questions,[]);
 assert.equal(Object.hasOwn(response,'correctIndex'),false);
});

test('a single supplied topic can be inferred when its ID is omitted',()=>{
 const raw=JSON.stringify([{...question,topicId:undefined}]);
 assert.equal(normalizeQuestions(raw,1,[topics[1]])[0].topicId,'maths');
 assert.throws(()=>normalizeQuestions(raw,1,topics));
});
