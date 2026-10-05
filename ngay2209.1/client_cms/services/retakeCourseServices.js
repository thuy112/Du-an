// Quản lý thông tin lớp học lại, khóa học lại.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/retake-courses', { params })
  },

  getDetail(id) {
    return Api.get(`/api/v1/retake-courses/${id}`)
  },

  create(data) {
    return Api.post('/api/v1/retake-courses', data)
  },

  update(id, data) {
    return Api.put(`/api/v1/retake-courses/${id}`, data)
  },

  delete(id) {
    return Api.delete(`/api/v1/retake-courses/${id}`)
  },

  exportExcel(params) {
    return Api.getBlob('/api/v1/retake-courses/export', { params })
  },

  addMustRetakeStudent(data) {
    return Api.post('/api/v1/retake-courses/must-retake-students', data)
  },
}