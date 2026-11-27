import test from 'node:test';
import assert from 'node:assert/strict';
import {inScope,scopedPlan,scopedAssessment} from '../src/services/scopeFilters.js';
const scope={topics:new Map([['m','Mathematics'],['p','Physics'],['c','Chemistry'],['b','Biology']])};
test('rejects foreign topics and mismatched subjects',()=>{assert.equal(inScope(scope,{topic:'m',subject:'Mathematics'}),true);assert.equal(inScope(scope,{topic:'e',subject:'Economics'}),false);assert.equal(inScope(scope,{topic:'m',subject:'Physics'}),false);});
test('historical plans hide foreign activities without changing stored input',()=>{const p={activities:[{topic:'m',subject:'Mathematics'},{topic:'e',subject:'Economics'}]};assert.equal(scopedPlan(scope,p).activities.length,1);assert.equal(p.activities.length,2);});
test('mixed or legacy assessments are not exposed',()=>{assert.equal(scopedAssessment(scope,{generatedQuestions:[{topicId:'p',subject:'Physics'}]}),true);assert.equal(scopedAssessment(scope,{generatedQuestions:[{topicId:'p',subject:'Physics'},{topicId:'e',subject:'Economics'}]}),false);assert.equal(scopedAssessment(scope,{}),false);});
