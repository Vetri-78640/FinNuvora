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
    // Rate limit by email address to prevent account takeover attempts
    return req.body?.email || 'anonymous';
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again later.'
    });
  },
  // Don't use IP-based detection if custom keyGenerator is set
  // This avoids the IPv6 validation error
});

module.exports = {
  authLimiter
};
