import test from 'node:test';
import assert from 'node:assert/strict';
import { isTrustedSessionCreation } from '../src/utils/originSecurity.js';
const allowedOrigins = ['https://apex.example'];
const check = (method, path, origin) => isTrustedSessionCreation({method,path,origin,allowedOrigins});
test('rejects untrusted browser login and registration origins', () => {
  for (const path of ['/api/v1/auth/login','/api/v1/auth/register']) {
    assert.equal(check('POST',path,'https://attacker.example'),false);
    assert.equal(check('POST',path,'https://apex.example.attacker.example'),false);
    assert.equal(check('POST',path,'null'),false);
  }
});
test('accepts trusted browser session creation', () => {
  assert.equal(check('POST','/api/v1/auth/login','https://apex.example'),true);
});
test('allows nonbrowser clients without Origin and unrelated requests', () => {
  assert.equal(check('POST','/api/v1/auth/login',undefined),true);
  assert.equal(check('GET','/api/v1/auth/login','https://attacker.example'),true);
  assert.equal(check('POST','/api/v1/academic/plans','https://attacker.example'),true);
});
