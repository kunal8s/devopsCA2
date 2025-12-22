import axiosClient from '../axiosClient';

export const adminUsersAPI = {
  /**
   * Fetch students for a specific institution / branch / year / section path.
   * The backend wraps the result in an ApiResponse, so here we unwrap it into
   * a predictable shape: { students: [], count: number }.
   */
  listStudents: async ({ institutionId, branchCode, batchYear, currentYear, section }) => {
    const params = {
      institutionId,
      branchCode,
      batchYear,
      currentYear,
      section,
    };

    const res = await axiosClient.get('/v1/admin/students', { params });
    const payload = res?.data ?? res;
    const apiData = payload?.data ?? payload;

    const students = Array.isArray(apiData?.students) ? apiData.students : [];
    const count =
      typeof apiData?.count === 'number'
        ? apiData.count
        : Array.isArray(students)
        ? students.length
        : 0;

    return { students, count };
  },

  /**
   * Fetch teachers by their teacher IDs
   * @param {string[]} teacherIds - Array of teacher ID strings
   * @returns {Promise<{teachers: [], count: number}>}
   */
  getTeachersByIds: async (teacherIds) => {
    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return { teachers: [], count: 0 };
    }

    const params = {
      teacherIds: teacherIds.join(','),
    };

    const res = await axiosClient.get('/v1/admin/teachers/by-ids', { params });
    const payload = res?.data ?? res;
    const apiData = payload?.data ?? payload;

    const teachers = Array.isArray(apiData?.teachers) ? apiData.teachers : [];
    const count =
      typeof apiData?.count === 'number'
        ? apiData.count
        : Array.isArray(teachers)
        ? teachers.length
        : 0;

    return { teachers, count };
  },
};

export default adminUsersAPI;




