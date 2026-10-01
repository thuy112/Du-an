// Quản lý quyết định chi trả thù lao giảng dạy/coi thi cho giảng viên
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/re-learning/decision-teacher-job-fees', { params })
  },

  getDetail(id) {
    return Api.get(`/api/v1/re-learning/decision-teacher-job-fees/${id}`)
  },

  create(data) {
    return Api.post('/api/v1/re-learning/decision-teacher-job-fees', data)
  },

  update(id, data) {
    return Api.put(`/api/v1/re-learning/decision-teacher-job-fees/${id}`, data)
  },

  delete(id) {
    return Api.delete(`/api/v1/re-learning/decision-teacher-job-fees/${id}`)
  },

  exportDecisionReport(id) {// Xuất báo cáo quyết định chi trả thù lao giảng dạy/coi thi cho giảng viên
    return Api.getBlob(`/api/v1/re-learning/decision-teacher-job-fees/${id}/export`)
  },
}