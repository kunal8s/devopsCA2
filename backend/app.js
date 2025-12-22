const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { errorHandler } = require('./src/middleware/error.js');
const metricsMiddleware = require('./src/middleware/metricsMiddleware');
const { register: metricsRegister } = require('./src/metrics/metrics');
require('dotenv').config();

// just a random line for devops project later be removed 
//ok
// Import routes
const authRoutes = require('./src/routes/api/v1/auth/authRoutes.js');
const teacherAuthRoutes = require('./src/routes/api/v1/auth/teacherAuthRoutes.js');
const studentRoutes = require('./src/routes/api/v1/users/studentRoutes.js');
const apiRoutes = require('./src/routes/api');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global HTTP metrics for all subsequent routes
app.use(metricsMiddleware);

// Session management for OTP verification flows
app.set('trust proxy', 1);
app.use(
  session({
    name: 'eps.sid',
    secret: process.env.SESSION_SECRET || 'exam-proctoring-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 60 * 1000 // 30 minutes
    }
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files for uploaded content (e.g., profile images)
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Prometheus metrics endpoint
app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', metricsRegister.contentType);
    const metrics = await metricsRegister.metrics();
    res.send(metrics);
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes); // versioned alias for students
app.use('/api/v1/auth/teacher', teacherAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
