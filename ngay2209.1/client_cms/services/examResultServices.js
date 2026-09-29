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
}

export default examResultServices