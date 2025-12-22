const express = require('express');
const router = express.Router();
const testController = require('../../../../controllers/test/testController');
const { protect } = require('../../../../middleware/auth');

/**
 * @route   POST /api/v1/tests
 * @desc    Create a new test with questions and student allocation
 * @access  Private (Admin/Teacher)
 */
router.post('/', testController.createTest);

/**
 * @route   GET /api/v1/tests
 * @desc    Get all tests (for admin scheduled exams page)
 * @access  Private (Admin)
 */
router.get('/', testController.getAllTests);

/**
 * @route   GET /api/v1/tests/diagnostic/:studentEmail
 * @desc    Diagnostic endpoint to check test allocation for a student
 * @access  Private (Admin/Dev)
 */
router.get('/diagnostic/:studentEmail', testController.diagnosticCheck);

/**
 * @route   GET /api/v1/tests/:id
 * @desc    Get test by ID (for student exam page)
 * @access  Private (Student)
 * NOTE: This route must come AFTER /diagnostic/:studentEmail to avoid route conflicts
 */
router.get('/:id', protect, testController.getTestById);

module.exports = router;

