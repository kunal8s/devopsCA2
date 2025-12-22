const Student = require('../../models/Student');
const ApiResponse = require('../../utils/helpers/apiResponse');
const asyncHandler = require('../../utils/helpers/asyncHandler');

// GET /api/v1/admin/students
// Query by institution -> branch -> year -> section
exports.listStudentsByPath = asyncHandler(async (req, res) => {
  const { institutionId, branchCode, batchYear, currentYear, section } = req.query;

  if (!institutionId || !branchCode || !batchYear || !currentYear || !section) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'institutionId, branchCode, batchYear, currentYear, and section are required'));
  }

  const filter = {
    'institution.id': institutionId,
    'branch.code': branchCode.toUpperCase(),
    batchYear: Number(batchYear),
    currentYear: Number(currentYear),
    section: section.trim().toUpperCase(),
  };

  const students = await Student.find(filter).select(
    'firstName lastName email institution branch batchYear currentYear section',
  );

  res
    .status(200)
    .json(new ApiResponse(200, { count: students.length, students }, 'Students fetched'));
});

// GET /api/v1/admin/teachers/by-ids
// Get teacher details by teacher IDs
exports.getTeachersByIds = asyncHandler(async (req, res) => {
  const { teacherIds } = req.query;

  if (!teacherIds) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'teacherIds query parameter is required (comma-separated)'));
  }

  const ids = Array.isArray(teacherIds) 
    ? teacherIds 
    : teacherIds.split(',').map(id => id.trim().toUpperCase());

  const Teacher = require('../../models/Teacher');
  const teachers = await Teacher.find({ 
    teacherId: { $in: ids } 
  }).select('teacherId firstName lastName email university');

  res
    .status(200)
    .json(new ApiResponse(200, { count: teachers.length, teachers }, 'Teachers fetched'));
});

