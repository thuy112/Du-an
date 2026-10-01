// Xử lý đăng ký lớp học lại của sinh viên.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/register-retake-courses', { params })
  },

  getDetail(id) {
    return Api.get(`/api/v1/register-retake-courses/${id}`)
  },

  create(data) {
    return Api.post('/api/v1/register-retake-courses', data)
  },

  updateStatus(id, statusData) {
    return Api.put(`/api/v1/register-retake-courses/${id}/status`, statusData)
  },

  delete(id) {
    return Api.delete(`/api/v1/register-retake-courses/${id}`)
  },

  exportExcel(params) {
    return Api.getBlob('/api/v1/register-retake-courses/export', { params })
  },
}