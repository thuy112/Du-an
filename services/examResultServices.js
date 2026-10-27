import Api from '~/api/Api.js'

const examResultServices = {
  async getExamResults(params) {
    return await Api.get('/api/v1/exam-results', { params })
  },

  async updateExamResults(data) {
    return await Api.post('/api/v1/exam-results/update', data)
  },

  async importExamResults(formData) {
    return await Api.postMultipart('/api/v1/exam-results/import', formData)
  },

  async exportExamResults(params) {
    return await Api.getBlob('/api/v1/exam-results/export', { params })
  },

  // Danh sách các API bổ sung cho module Kết quả học lại & Import
  async getRetakeCourseResults(params) {
    return await Api.get('/api/RetakeCourseResult', { params })
  },

  async getRetakeSessions(params) {
    return await Api.get('/api/retakeSession/list', { params })
  },

  async getClasses(params) {
    return await Api.get('/api/classes/all', { params })
  },

  async getCoefficients(params) {
    return await Api.get('/api/coefficient', { params })
  },

  async getRetakeCourses(params) {
    return await Api.get('/api/retakeCourse', { params })
  },

  async checkImport(formData) {
    return await Api.postMultipart('/api/redefense/result/import/check', formData)
  },

  async saveImport(formData) {
    return await Api.postMultipart('/api/redefense/result/import', formData)
  },
}

export default examResultServices