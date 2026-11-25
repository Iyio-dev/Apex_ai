import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

// Limits are per process with the default store. Use a shared store for multiple replicas.
export const LIMITS = Object.freeze({
  general: { windowMs: 15 * 60_000, limit: 300 },
  auth: { windowMs: 15 * 60_000, limit: 10 },
  registration: { windowMs: 60 * 60_000, limit: 5 },
  ai: { windowMs: 60 * 60_000, limit: 12 },
  generation: { windowMs: 60 * 60_000, limit: 20 },
  assessment: { windowMs: 15 * 60_000, limit: 30 },
  writes: { windowMs: 15 * 60_000, limit: 100 },
});

const response = (name, req) => ({
  success: false,
  message: `Too many ${name} requests. Please retry later.`,
  code: "RATE_LIMITED",
  requestId: req.id,
});

const createLimiter = (name, options = {}) => rateLimit({
  ...LIMITS[name],
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json(response(name, req)),
  ...options,
});

// IPv6 address grouping is provided by express-rate-limit's standard generator.
export const generalLimiter = createLimiter('general');
export const loginLimiter = createLimiter('auth');
export const registrationLimiter = createLimiter('registration');

// These run after authMiddleware; user identity, not spoofable request headers, is the key.
const studentKey = (req) => req.user?._id?.toString() ?? ipKeyGenerator(req.ip);
export const aiLimiter = createLimiter('ai', { keyGenerator: studentKey });
export const generationLimiter = createLimiter('generation', { keyGenerator: studentKey });
export const assessmentLimiter = createLimiter('assessment', { keyGenerator: studentKey });
export const writeLimiter = createLimiter('writes', { keyGenerator: studentKey });
