import test from 'node:test';
import assert from 'node:assert/strict';
import {scheduleSessions,fallbackSessions} from '../src/services/studyScheduleEngine.js';
const candidates=[{subject:'Mathematics',topic:{_id:'a',name:'Algebra'},weak:true}];
test('fallback repeats a small topic pool across study days',()=>{
 const preferences={days:7,breakDays:[0,6],interestNote:''};
 const sessions=fallbackSessions(candidates,preferences,45);
 const activities=scheduleSessions({sessions,candidates,preferences,start:'2026-11-14',maxPerDay:45,weeklyMinutes:180});
 assert.ok(activities.length>=2);
 assert.ok(activities.every(a=>a.estimatedMinutes<=45));
});
test('weekly budget is never exceeded',()=>{
 const preferences={days:14,breakDays:[],interestNote:''};
 const sessions=Array.from({length:14},(_,day)=>({topicId:'a',day,minutes:60,priority:'high'}));
 const activities=scheduleSessions({sessions,candidates,preferences,start:'2026-11-16',maxPerDay:60,weeklyMinutes:90});
 for(let week=0;week<2;week++)assert.ok(activities.filter(a=>Math.floor(a.day/7)===week).reduce((sum,a)=>sum+a.estimatedMinutes,0)<=90);
});
