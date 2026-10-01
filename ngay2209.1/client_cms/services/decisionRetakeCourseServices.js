// Quản lý các quyết định mở lớp / mở đợt học lại.
import Api from '~/api/Api'

export default {
  getList(params) {//Lấy danh sách quyết định mở lớp / mở đợt học lại
    return Api.get('/api/v1/decision-retake-courses', { params })
  },

  getDetail(id) {//Lấy chi tiết quyết định mở lớp / mở đợt học lại
    return Api.get(`/api/v1/decision-retake-courses/${id}`)
  },

  create(data) {//Tạo quyết định mở lớp / mở đợt học lại
    return Api.post('/api/v1/decision-retake-courses', data)
  },

  update(id, data) {
    return Api.put(`/api/v1/decision-retake-courses/${id}`, data)
  },

  delete(id) {
    return Api.delete(`/api/v1/decision-retake-courses/${id}`)
  },

  uploadFile(data) {
    return Api.postMultipart('/api/v1/decision-retake-courses/upload', data)
  },
}