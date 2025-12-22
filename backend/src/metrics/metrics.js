const client = require('prom-client');

// Create a dedicated registry so we control what gets exposed
const register = new client.Registry();

// Default labels applied to all metrics
register.setDefaultLabels({
  app: 'exam-proctoring-backend',
});

// Collect default Node.js process metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
});

// HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  // Sane default buckets for web latency (in seconds)
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
});

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

/**
 * Domain / business metrics
 */

// Number of exams that are currently visible/available to students
const examActiveTotal = new client.Gauge({
  name: 'exam_active_total',
  help: 'Number of exams that are currently available to students',
});

// Exam creation events
const examCreatedTotal = new client.Counter({
  name: 'exam_created_total',
  help: 'Total number of exams created',
  labelNames: ['test_type'],
});

// Exam submission lifecycle
const examSubmissionsTotal = new client.Counter({
  name: 'exam_submissions_total',
  help: 'Total number of exam submissions',
  // status: success | failed_validation | failed_server | duplicate | late
  labelNames: ['status'],
});

const examSubmissionFailuresTotal = new client.Counter({
  name: 'exam_submission_failures_total',
  help: 'Total number of failed exam submissions',
  // reason: validation_error | server_error | not_allowed | window_closed | other
  labelNames: ['reason'],
});

// File uploads (avatars, exam videos, attachments, etc.)
const fileUploadsTotal = new client.Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  // type: avatar | exam_video | attachment | other
  // status: success | failure
  labelNames: ['type', 'status'],
});

// Video processing pipeline
const videoProcessingTotal = new client.Counter({
  name: 'video_processing_total',
  help: 'Total number of video processing attempts',
  // result: started | success | failure
  labelNames: ['result'],
});

const videoProcessingFailuresTotal = new client.Counter({
  name: 'video_processing_failures_total',
  help: 'Total number of failed video processing attempts',
  // error_type: decode_error | timeout | storage_error | other
  labelNames: ['error_type'],
});

const videoProcessingDurationSeconds = new client.Histogram({
  name: 'video_processing_duration_seconds',
  help: 'Duration of video processing jobs in seconds',
  // result: success | failure
  labelNames: ['result'],
  buckets: [1, 3, 5, 10, 20, 30, 60, 120, 300],
});

// Proctoring / monitoring events
const proctoringViolationsTotal = new client.Counter({
  name: 'proctoring_violations_total',
  help: 'Total number of proctoring violations detected by AI or human proctors',
  // type: multiple_faces | no_face | eye_off_screen | audio_noise | tab_switch | other
  labelNames: ['type'],
});

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(examActiveTotal);
register.registerMetric(examCreatedTotal);
register.registerMetric(examSubmissionsTotal);
register.registerMetric(examSubmissionFailuresTotal);
register.registerMetric(fileUploadsTotal);
register.registerMetric(videoProcessingTotal);
register.registerMetric(videoProcessingFailuresTotal);
register.registerMetric(videoProcessingDurationSeconds);
register.registerMetric(proctoringViolationsTotal);

module.exports = {
  register,
  httpRequestDurationSeconds,
  httpRequestsTotal,
  examActiveTotal,
  examCreatedTotal,
  examSubmissionsTotal,
  examSubmissionFailuresTotal,
  fileUploadsTotal,
  videoProcessingTotal,
  videoProcessingFailuresTotal,
  videoProcessingDurationSeconds,
  proctoringViolationsTotal,
};
