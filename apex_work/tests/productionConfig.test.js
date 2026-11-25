import {randomBytes} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProductionConfig } from '../src/utils/productionConfig.js';

const valid = {
  NODE_ENV: 'production',
  JWT_SECRET: randomBytes(32).toString('hex'),
  MONGODB_URI: 'mongodb+srv://cluster.example.invalid/apex',
  CLIENT_URL: 'https://example.vercel.app',
};
test('valid production configuration is accepted', () => assert.doesNotThrow(() => validateProductionConfig(valid)));
test('missing production secret is rejected', () => assert.throws(() => validateProductionConfig({ ...valid, JWT_SECRET: '' })));
test('placeholder production secret is rejected', () => assert.throws(() => validateProductionConfig({ ...valid, JWT_SECRET: 'replace-this-with-a-long-enough-value' })));
test('local development database is rejected in production', () => assert.throws(() => validateProductionConfig({ ...valid, MONGODB_URI: 'mongodb://127.0.0.1:27017/apex' })));
test('HTTP frontend origin is rejected in production', () => assert.throws(() => validateProductionConfig({ ...valid, CLIENT_URL: 'http://example.com' })));
test('development permits local settings', () => assert.doesNotThrow(() => validateProductionConfig({ NODE_ENV: 'development' })));
