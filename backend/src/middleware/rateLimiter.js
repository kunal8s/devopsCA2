const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum number of requests
 * @param {number} windowMinutes - Time window in minutes
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      status: 'error',
      message: `Too many requests from this IP, please try again after ${windowMinutes} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = createRateLimiter;