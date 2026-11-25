// Keep origin decisions independent of Express so they can be regression-tested.
export function configuredOrigins(clientUrl, environment = 'development') {
  if (environment === 'production' && !clientUrl?.trim()) {
    throw new Error('CLIENT_URL must be explicitly configured in production.');
  }
  const origins = (clientUrl || 'http://localhost:5173').split(',').map(value => value.trim()).filter(Boolean);
  if (!origins.length) throw new Error('At least one trusted client origin is required.');
  for (const origin of origins) {
    let parsed;
    try { parsed = new URL(origin); } catch { throw new Error(`Invalid CLIENT_URL origin`); }
    if (parsed.origin !== origin || parsed.username || parsed.password || !['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`CLIENT_URL must contain exact origins without paths`);
    }
    if (environment === 'production' && parsed.protocol !== 'https:') {
      throw new Error('Production CLIENT_URL origins must use HTTPS.');
    }
  }
  return [...new Set(origins)];
}

export function isTrustedCookieMutation({ method, hasSessionCookie, origin, allowedOrigins }) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) || !hasSessionCookie) return true;
  return typeof origin === 'string' && allowedOrigins.includes(origin);
}

// Login/register set a session cookie, so an untrusted browser origin must not
// be allowed to create a session even when no cookie exists yet.
export function isTrustedSessionCreation({ method, path, origin, allowedOrigins }) {
  if (method.toUpperCase() !== 'POST' || !['/api/v1/auth/login', '/api/v1/auth/register'].includes(path.toLowerCase().replace(/\/$/, ''))) return true;
  // Non-browser API clients may omit Origin. Browsers sending Origin must match.
  return origin === undefined || (typeof origin === 'string' && allowedOrigins.includes(origin));
}
