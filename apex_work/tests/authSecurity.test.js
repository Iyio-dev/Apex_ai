import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAuthToken } from '../src/utils/authToken.js';
import contentEditorMiddleware from '../src/middleware/contentEditorMiddleware.js';

test('accepts a cookie-only session', () => assert.equal(extractAuthToken(undefined, 'cookie-token'), 'cookie-token'));
test('accepts a bearer-only session', () => assert.equal(extractAuthToken('Bearer header-token', undefined), 'header-token'));
test('rejects conflicting authentication sources', () => assert.throws(() => extractAuthToken('Bearer header-token', 'cookie-token'), {statusCode:400}));
test('rejects malformed bearer credentials', () => {
  for (const value of ['Basic xyz', 'Bearer ', 'Bearer a b', 'bearer abc']) assert.throws(() => extractAuthToken(value, undefined), {statusCode:401});
});
test('rejects missing authentication', () => assert.throws(() => extractAuthToken(undefined, undefined), {statusCode:401}));
test('denies student access to content editing', () => {
  let err; contentEditorMiddleware({user:{role:'student'}}, {}, e => {err=e;});
  assert.equal(err.statusCode, 403);
});
test('permits editor and admin access', () => {
  for (const role of ['admin','content_editor']) {
    let err = 'not-called'; contentEditorMiddleware({user:{role}}, {}, e => {err=e;});
    assert.equal(err, undefined);
  }
});
