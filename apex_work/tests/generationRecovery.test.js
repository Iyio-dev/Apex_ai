import test from 'node:test';
import assert from 'node:assert/strict';
import {collectQuestions} from '../src/services/aiPracticeService.js';
import {rateLimitError} from '../src/utils/aiFailure.js';

function question(i) {
  return {text:`What is the value of ${i} plus one?`, options:['1','2','3','4'], correctIndex:1, explanation:'Example.'};
}

test('combine partial batches and report rejection reasons without logging question text',()=>{
 const accepted=[];
 const first=Array.from({length:8},(_,i)=>question(i));
 const invalid={...question(9),options:['1','1','2','3']};
 const reasons=collectQuestions(JSON.stringify([...first,invalid,null]),10,undefined,accepted);
 assert.equal(accepted.length,8);
 assert.equal(reasons.invalidFields,1);
 assert.equal(reasons.duplicateOptions,1);
 const second=collectQuestions(JSON.stringify([question(0),question(8),question(9)]),10,undefined,accepted);
 assert.equal(second.duplicateQuestions,1);
 assert.equal(new Set(accepted.map(q=>q.text)).size,10);
});
test('rate limit supports delta seconds and HTTP dates, with a default for absent headers',t=>{
 const now=Date.UTC(2026,0,1);
 t.mock.method(Date,'now',()=>now);
 for(const [header,seconds] of [['12',12],[new Date(now+9000).toUTCString(),9],[undefined,30]]){
  const e=rateLimitError({headers:new Headers(header?{'Retry-After':header}:{})});
  assert.equal(e.statusCode,429);assert.equal(e.retryAfterSeconds,seconds);
 }
});
