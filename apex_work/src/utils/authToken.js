import AppError from './AppError.js';

// One credential source per request avoids ambiguous session identity.
export function extractAuthToken(authorization, cookieToken) {
  if (authorization !== undefined && authorization !== null) {
    if (typeof authorization !== 'string' || !/^Bearer [^\s]+$/.test(authorization)) {
      throw new AppError('Invalid authorization header.', 401);
    }
    if (cookieToken) throw new AppError('Use either bearer authentication or a session cookie, not both.', 400);
    return authorization.slice(7);
  }
  if (cookieToken) return cookieToken;
  throw new AppError('Authentication token is required.', 401);
}
