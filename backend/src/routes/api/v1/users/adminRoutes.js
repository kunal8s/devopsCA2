const express = require('express');
const router = express.Router();
const adminController = require('../../../../controllers/user/adminController');

// TODO: add admin auth middleware when available
router.get('/students', adminController.listStudentsByPath);
router.get('/teachers/by-ids', adminController.getTeachersByIds);

module.exports = router;






