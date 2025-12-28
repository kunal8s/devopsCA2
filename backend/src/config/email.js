const nodemailer = require('nodemailer');

// Support both EMAIL_* and SMTP_* environment variables
const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
const username = process.env.SMTP_USERNAME || process.env.EMAIL_USER;
const password = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

// Support for SendGrid (cloud-friendly alternative)
const sendGridApiKey = process.env.SENDGRID_API_KEY;

// Create transporter
let transporter;

// Priority 1: Use SendGrid if available (best for cloud)
if (sendGridApiKey) {
  transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: sendGridApiKey
    }
  });
  console.log('✓ Using SendGrid for email delivery (cloud-optimized)');
}
// Priority 2: Use SMTP if configured
else if (host && port && username && password) {
  const portNum = Number(port);
  const isSecure = portNum === 465;
  
  // Create transporter with cloud-optimized settings
  transporter = nodemailer.createTransport({
    host: host,
    port: portNum,
    secure: isSecure,
    requireTLS: !isSecure && (portNum === 587 || portNum === 25),
    auth: {
      user: username,
      pass: password,
    },
    // Optimized for cloud environments
    connectionTimeout: 20000, // 20 seconds - shorter for faster failure detection
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 20000, // 20 seconds
    // Disable pooling for cloud environments
    pool: false,
    // Cloud-friendly TLS settings
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      ciphers: 'SSLv3'
    },
    // Disable DNS lookup caching (can cause issues in cloud)
    dns: {
      cache: false
    }
  });

  // Don't verify on startup - verify on first use instead (faster startup)
  console.log('✓ SMTP transporter configured (will verify on first email send)');
} else {
  // Fallback to jsonTransport if no email config is available
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  console.warn('⚠ Email configuration not found. Using fallback mode (emails will not be sent).');
  console.warn('Required variables: SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD');
  console.warn('OR use SENDGRID_API_KEY for cloud-optimized email delivery');
}

module.exports = transporter;