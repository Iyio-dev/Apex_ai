import test from 'node:test';
import assert from 'node:assert/strict';
import {registerSchema} from '../src/validators/authValidators.js';
import {isTrustedSessionCreation} from '../src/utils/originSecurity.js';
import errorMiddleware from '../src/middleware/errorMiddleware.js';

test('registration enforces the bcrypt byte boundary for multibyte passwords',()=>{
  const form={name:'QA Student',email:'fixture@example.invalid'};
  assert.ok(registerSchema.safeParse({...form,password:'é'.repeat(36)}).success);
  assert.equal(registerSchema.safeParse({...form,password:'é'.repeat(37)}).success,false);
});
test('session origin guard follows Express case and trailing slash semantics',()=>{
  for(const path of ['/api/v1/auth/login/','/API/V1/AUTH/REGISTER']){
    assert.equal(isTrustedSessionCreation({method:'POST',path,origin:'https://other.invalid',allowedOrigins:[]}),false);
  }
});
test('internal error logs contain only operational metadata',t=>{
  const logged=[];
  t.mock.method(console,'error',value=>logged.push(JSON.parse(value)));
  const res={status(){return this},json(){}};
  errorMiddleware(new Error('synthetic private text'),{id:'qa',method:'GET'},res,()=>{});
  assert.deepEqual(logged,[{level:'error',requestId:'qa',method:'GET',status:500,code:'INTERNAL_ERROR'}]);
});
