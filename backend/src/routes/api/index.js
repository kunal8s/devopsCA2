const express = require('express');
const router = express.Router();

// Import route modules
const statsRoutes = require('./v1/statsRoutes');
const studentRoutes = require('./v1/studentRoutes');
const authRoutes = require('./v1/auth/authRoutes');
const teacherAuthRoutes = require('./v1/auth/teacherAuthRoutes');
const academicRoutes = require('./v1/academics/academicRoutes');
const adminUserRoutes = require('./v1/users/adminRoutes');
const testRoutes = require('./v1/tests/testRoutes');

// Mount API routes
router.use('/v1/stats', statsRoutes);
router.use('/v1/student', studentRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/auth/teacher', teacherAuthRoutes);
router.use('/v1/academics', academicRoutes);
router.use('/v1/admin', adminUserRoutes);
router.use('/v1/tests', testRoutes);

// API root
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Exam Proctoring System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      tests: '/api/v1/tests',
      proctoring: '/api/v1/proctoring',
      stats: '/api/v1/stats',
      health: '/health'
    },
    documentation: '/api/docs',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;