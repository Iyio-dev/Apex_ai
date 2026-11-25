import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredOrigins, isTrustedCookieMutation } from '../src/utils/originSecurity.js';

test('production fails closed without trusted frontend', () => {
  assert.throws(() => configuredOrigins('', 'production'), /CLIENT_URL/);
  assert.throws(() => configuredOrigins('http://example.com', 'production'), /HTTPS/);
  assert.throws(() => configuredOrigins('https://example.com/path', 'production'), /exact origins/);
});
test('valid production origins are deduplicated', () => {
  assert.deepEqual(configuredOrigins('https://app.example.com,https://app.example.com', 'production'), ['https://app.example.com']);
});
test('cookie mutation requires an exact trusted Origin even when bearer header might be present', () => {
  const allowedOrigins = ['https://app.example.com'];
  const check = (method, origin) => isTrustedCookieMutation({method, origin, hasSessionCookie:true, allowedOrigins});
  assert.equal(check('POST', undefined), false);
  assert.equal(check('POST', 'https://evil.example.com'), false);
  assert.equal(check('DELETE', 'https://app.example.com.evil.com'), false);
  assert.equal(check('POST', 'https://app.example.com'), true);
  assert.equal(check('GET', undefined), true);
});
