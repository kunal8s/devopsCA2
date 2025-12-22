import axiosClient from '../axiosClient';

/**
 * Test API - Backend integration
 * Handles test creation, listing, and retrieval from the backend
 */
export const testAPI = {
  /**
   * List all tests (for admin scheduled exams page)
   * @returns {Promise<Array>} Array of test objects
   */
  list: async () => {
    try {
      const response = await axiosClient.get('/v1/tests');
      const payload = response?.data ?? response;
      const apiData = payload?.data ?? payload;
      
      // Handle both direct array and wrapped response
      if (Array.isArray(apiData?.tests)) {
        return apiData.tests;
      }
      if (Array.isArray(apiData)) {
        return apiData;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      // Fallback to empty array on error
      return [];
    }
  },

  /**
   * Create a new test with questions and student allocation
   * @param {Object} payload - Test data including name, type, questions, schedule, allocations
   * @returns {Promise<Object>} Created test object
   */
  create: async (payload) => {
    try {
      const response = await axiosClient.post('/v1/tests', payload);
      const apiResponse = response?.data ?? response;
      const testData = apiResponse?.data ?? apiResponse;
      
      // Return the test object in a format compatible with existing code
      return {
        id: testData?.test?._id || testData?.test?.id || testData?.id,
        ...testData?.test,
        ...testData,
      };
    } catch (error) {
      console.error('Failed to create test:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create test';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get test by ID (for student exam page)
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Test object with questions
   */
  getById: async (testId) => {
    try {
      const response = await axiosClient.get(`/v1/tests/${testId}`);
      const apiResponse = response?.data ?? response;
      const testData = apiResponse?.data ?? apiResponse;
      
      return testData;
    } catch (error) {
      console.error('Failed to fetch test:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch test';
      throw new Error(errorMessage);
    }
  },

  /**
   * Clear all tests (admin utility - not implemented in backend yet)
   * @returns {Promise<void>}
   */
  clear: async () => {
    console.warn('clear() is not implemented in backend API');
    return Promise.resolve();
  },
};

export default testAPI;
