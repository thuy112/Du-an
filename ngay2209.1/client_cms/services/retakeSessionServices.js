// Quản lý đợt, kỳ học lại.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/retake-sessions', { params })
  },

  getDetail(id) {
    return Api.get(`/api/v1/retake-sessions/${id}`)
  },

  create(data) {
    return Api.post('/api/v1/retake-sessions', data)
  },

  update(id, data) {
    return Api.put(`/api/v1/retake-sessions/${id}`, data)
  },

  delete(id) {
    return Api.delete(`/api/v1/retake-sessions/${id}`)
  },

  exportExcel(params) {
    return Api.getBlob('/api/v1/retake-sessions/export', { params })
  },
}