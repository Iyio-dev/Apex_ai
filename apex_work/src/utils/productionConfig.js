import { configuredOrigins } from './originSecurity.js';

export function validateProductionConfig(env) {
  if (env.NODE_ENV !== 'production') return;
  const secret = env.JWT_SECRET || '';
  if (secret.length < 32 || /^(replace|change|example|secret|test)/i.test(secret)) {
    throw new Error('Production JWT_SECRET must be a non-placeholder secret of at least 32 characters.');
  }
  if (!env.MONGODB_URI || !/^mongodb(\+srv)?:\/\//.test(env.MONGODB_URI)) {
    throw new Error('Production MONGODB_URI must be configured.');
  }
  if (/^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(env.MONGODB_URI)) {
    throw new Error('Production database must not use the default local development address.');
  }
  configuredOrigins(env.CLIENT_URL, env.NODE_ENV);
}
