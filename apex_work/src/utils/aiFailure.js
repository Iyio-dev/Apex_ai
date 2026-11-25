import AppError from './AppError.js';

export function rateLimitError(error) {
  const headers = error.headers;
  const raw = headers?.get?.('retry-after') ?? headers?.['retry-after'];
  let seconds = 30;
  if (raw != null && String(raw).trim() !== '') {
    const delay = Number(raw);
    const parsed = Number.isFinite(delay) ? delay : (Date.parse(raw) - Date.now()) / 1000;
    if (Number.isFinite(parsed)) seconds = Math.max(1, Math.ceil(parsed));
  }
  const result = new AppError('AI usage limit reached. Please wait before trying again.', 429, 'AI_RATE_LIMITED');
  result.retryAfterSeconds = seconds;
  return result;
}

export function providerFailureKind(error) {
  if (error.name === 'APIConnectionTimeoutError') return 'timeout';
  if (error.name === 'APIConnectionError') return 'connection';
  if (error.status === 429) return 'rate_limit';
  return Number.isInteger(error.status) ? 'provider_http' : 'provider_error';
}
