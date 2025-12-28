const nodemailer = require('nodemailer');

// Support both EMAIL_* and SMTP_* environment variables
const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
const username = process.env.SMTP_USERNAME || process.env.EMAIL_USER;
const password = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

// Create transporter if credentials are available
let transporter;

if (host && port && username && password) {
  transporter = nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: username,
      pass: password,
    },
    // Increase timeouts to prevent connection timeouts
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 30000, // 30 seconds
    // Retry configuration
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
} else {
  // Fallback to jsonTransport if no email config is available
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  console.warn('Email configuration not found. Using fallback mode (emails will not be sent).');
}

module.exports = transporter;