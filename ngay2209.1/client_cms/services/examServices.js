import Api from '~/api/Api.js'

const examServices = {
  async getExamList(params) {
    return await Api.get('/api/v1/exam-periods', { params })
  },

  async getExamDetail(id) {
    return await Api.get(`/api/v1/exam-periods/${id}`)
  },

  async createExam(data) {
    return await Api.post('/api/v1/exam-periods', data)
  },

  async updateExam(id, data) {
    return await Api.put(`/api/v1/exam-periods/${id}`, data)
  },

  async updateExamStatus(id, status) {
    return await Api.put(`/api/v1/exam-periods/${id}/status`, { status })
  },

  async deleteExam(id) {
    return await Api.delete(`/api/v1/exam-periods/${id}`)
  },
}

export default examServices