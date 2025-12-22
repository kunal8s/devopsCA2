const { httpRequestDurationSeconds, httpRequestsTotal } = require('../metrics/metrics');

/**
 * Global HTTP metrics middleware.
 *
 * Records:
 * - Total request count
 * - Request duration histogram
 *
 * Applied early in the middleware chain so it covers all API routes.
 */
function metricsMiddleware(req, res, next) {
  // Avoid self-scraping noise
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - startTime;
    const durationSeconds = Number(durationNs) / 1e9;

    // Use the Express route path template for low-cardinality labels
    // Fallback to 'unknown_route' for non-matched/404 routes.
    const routePath =
      (req.route && req.route.path && req.baseUrl + req.route.path) || 'unknown_route';

    const labels = {
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode),
    };

    httpRequestDurationSeconds.observe(labels, durationSeconds);
    httpRequestsTotal.inc(labels);
  });

  next();
}

module.exports = metricsMiddleware;




