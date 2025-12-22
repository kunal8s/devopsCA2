/* 
 * Simple synthetic load generator for metrics testing.
 *
 * This script is meant for **staging** environments to:
 * - Drive steady traffic through the API so Prometheus/Grafana dashboards show real data.
 * - Exercise latency and error-rate alerts (when combined with test scenarios).
 *
 * Usage (from backend directory, with the backend already running):
 *
 *   # Basic run against local dev/staging backend
 *   LOAD_TEST_BASE_URL=http://localhost:5000 npm run metrics:load
 *
 *   # Custom duration (in seconds) and concurrency
 *   LOAD_TEST_BASE_URL=http://localhost:5000 \
 *   LOAD_TEST_DURATION_SECONDS=600 \
 *   LOAD_TEST_CONCURRENCY=10 \
 *   npm run metrics:load
 *
 * Notes:
 * - This only generates **normal** traffic (e.g. /api/health).
 * - To test error-rate alerts, combine this script with manual or scripted calls
 *   that trigger 5xx responses (e.g. a dedicated staging-only failure endpoint).
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.LOAD_TEST_BASE_URL || 'http://localhost:5000';
const DURATION_SECONDS = parseInt(process.env.LOAD_TEST_DURATION_SECONDS || '300', 10); // 5 minutes
const CONCURRENCY = parseInt(process.env.LOAD_TEST_CONCURRENCY || '5', 10);

// Basic targets that are safe to hit frequently in staging.
// You can extend this list with other low-risk endpoints (e.g. read-only dashboards).
const TARGETS = [
  { method: 'GET', path: '/api/health' },
];

let totalRequests = 0;
let totalSuccess = 0;
let totalFailure = 0;

function makeRequest(target) {
  return new Promise((resolve) => {
    let urlObj;
    try {
      urlObj = new URL(target.path, BASE_URL);
    } catch (err) {
      console.error('[load] Invalid BASE_URL or path:', err.message);
      totalFailure += 1;
      return resolve();
    }

    const httpModule = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: target.method,
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + (urlObj.search || ''),
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    };

    const req = httpModule.request(options, (res) => {
      // Drain response to free up the socket
      res.on('data', () => {});
      res.on('end', () => {
        totalRequests += 1;
        if (res.statusCode >= 200 && res.statusCode < 500) {
          totalSuccess += 1;
        } else {
          totalFailure += 1;
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      totalRequests += 1;
      totalFailure += 1;
      console.error(`[load] Request error: ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      totalRequests += 1;
      totalFailure += 1;
      console.error('[load] Request timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function worker(id, endTime) {
  console.log(`[worker-${id}] started`);
  while (Date.now() < endTime) {
    for (const target of TARGETS) {
      // eslint-disable-next-line no-await-in-loop
      await makeRequest(target);
    }
  }
  console.log(`[worker-${id}] finished`);
}

async function main() {
  console.log('[load] Starting synthetic load generator');
  console.log(`[load] BASE_URL=${BASE_URL}`);
  console.log(`[load] DURATION_SECONDS=${DURATION_SECONDS}`);
  console.log(`[load] CONCURRENCY=${CONCURRENCY}`);

  const endTime = Date.now() + DURATION_SECONDS * 1000;

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i += 1) {
    workers.push(worker(i + 1, endTime));
  }

  await Promise.all(workers);

  console.log('[load] Completed synthetic load run');
  console.log(`[load] Total requests:   ${totalRequests}`);
  console.log(`[load] Successful (2xx-4xx): ${totalSuccess}`);
  console.log(`[load] Failed (errors/timeouts/5xx): ${totalFailure}`);

  process.exit(0);
}

main().catch((err) => {
  console.error('[load] Fatal error in synthetic load script:', err);
  process.exit(1);
});




