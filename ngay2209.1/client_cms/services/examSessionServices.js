import Api from '~/api/Api.js'

const examSessionServices = {
  async getSessions(params) {
    return await Api.get('/api/v1/exam-sessions', { params })
  },

  async getSessionDetail(id) {
    return await Api.get(`/api/v1/exam-sessions/${id}`)
  },

  async createSession(data) {
    return await Api.post('/api/v1/exam-sessions', data)
  },

  async updateSession(id, data) {
    return await Api.put(`/api/v1/exam-sessions/${id}`, data)
  },

  async deleteSession(id) {
    return await Api.delete(`/api/v1/exam-sessions/${id}`)
  },
}

export default examSessionServices