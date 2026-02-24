const rateLimit = require('express-rate-limit');

/**
 * Auth endpoint rate limiter
 * Prevents brute force by limiting login attempts per email
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  // Extract email from request body for rate limiting
  keyGenerator: (req) => {
    return req.body?.email || 'anonymous';
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again later.'
    });
  },
});

module.exports = {
  authLimiter
};
