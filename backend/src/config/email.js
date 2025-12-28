const nodemailer = require('nodemailer');

// Support both EMAIL_* and SMTP_* environment variables
const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
const username = process.env.SMTP_USERNAME || process.env.EMAIL_USER;
const password = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

// Create transporter if credentials are available
let transporter;

if (host && port && username && password) {
  const portNum = Number(port);
  const isSecure = portNum === 465;
  
  transporter = nodemailer.createTransport({
    host: host,
    port: portNum,
    secure: isSecure, // true for 465, false for other ports
    requireTLS: !isSecure && portNum === 587, // Use TLS for port 587
    auth: {
      user: username,
      pass: password,
    },
    // Increase timeouts to prevent connection timeouts
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Disable pooling for better reliability
    pool: false,
    // Retry configuration
    tls: {
      // Do not fail on invalid certificates
      rejectUnauthorized: false,
      // Allow legacy TLS
      minVersion: 'TLSv1',
    },
  });

  // Verify connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection verification failed:', error.message);
      console.error('SMTP Config:', {
        host,
        port: portNum,
        secure: isSecure,
        username: username.substring(0, 3) + '***' // Partially hide username
      });
    } else {
      console.log('✓ SMTP server connection verified successfully');
    }
  });
} else {
  // Fallback to jsonTransport if no email config is available
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  console.warn('⚠ Email configuration not found. Using fallback mode (emails will not be sent).');
  console.warn('Required variables: SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD');
}

module.exports = transporter;