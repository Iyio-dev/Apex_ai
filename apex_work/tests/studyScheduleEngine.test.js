import test from 'node:test';
import assert from 'node:assert/strict';
import {scheduleSessions,fallbackSessions} from '../src/services/studyScheduleEngine.js';
const candidates=[{subject:'Math',topic:{_id:'a',name:'Differentiation',objectives:['Differentiate polynomial functions','Find stationary points'],subtopics:[{name:'Power rule'},{name:'Chain rule'}]},weak:true},{subject:'Math',topic:{_id:'b',name:'Integration',objectives:['Evaluate definite integrals'],subtopics:[{name:'Substitution'}]}}];
const preferences={days:7,breakDays:[0,6],interestNote:'practice'};
test('AI sessions on rest days are moved to valid weekdays',()=>{
 const sessions=[{topicId:'a',day:0,minutes:60,priority:'high'},{topicId:'b',day:1,minutes:60,priority:'medium'}];
 const result=scheduleSessions({sessions,candidates,preferences,start:'2026-11-14',maxPerDay:90,weeklyMinutes:240});
 assert.equal(result.length,2);
 for(const a of result){const d=new Date(`2026-11-${String(14+a.day).padStart(2,'0')}T12:00:00Z`);assert.ok(![0,6].includes(d.getUTCDay()));}
});
test('fallback creates valid study sessions when AI is unavailable',()=>{
 const sessions=fallbackSessions(candidates,preferences,60);
 const result=scheduleSessions({sessions,candidates,preferences,start:'2026-11-14',maxPerDay:60,weeklyMinutes:180});
 assert.ok(result.length>0);
 assert.ok(result.every(a=>a.estimatedMinutes<=60));
});
test('AI-generated session objectives and syllabus subtopics are stored on the activity',()=>{
 const result=scheduleSessions({sessions:[{topicId:'a',day:1,minutes:45,priority:'high',objectives:['Differentiate a composite polynomial using the chain rule']}],candidates,preferences,start:'2026-11-14',maxPerDay:60,weeklyMinutes:180});
 assert.deepEqual(result[0].personalObjectives,['Differentiate a composite polynomial using the chain rule']);
 assert.deepEqual(result[0].personalSubtopics,['Power rule','Chain rule']);
});
test('rule-based fallback uses objectives from the syllabus topic',()=>{
 const sessions=fallbackSessions(candidates,preferences,60);
 const result=scheduleSessions({sessions,candidates,preferences,start:'2026-11-14',maxPerDay:60,weeklyMinutes:180});
 assert.deepEqual(result[0].personalObjectives,['Differentiate polynomial functions','Find stationary points']);
});
