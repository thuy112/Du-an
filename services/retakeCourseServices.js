import Api from '~/api/Api.js'

export default {
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },

  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },

  getSemesters(params) {
    return Api.get('/api/semester/list', params)
  },

  getRetakeSessions(params) {
    return Api.get('/api/retakeSession', params)
  },
  changeStatusCourse(id, data) {
    return Api.put(`/api/retakeCourse/changeRetakeCourseStatus/${id}`, data)
  },
  // Cập nhật trạng thái duyệt lớp học lại
  updateCourseStatus(id, data) {
    return Api.put(`/api/retakeCourse/${id}/status`, data)
  },

  // Thêm mới đợt đăng ký học lại
  createRetakeSession(data) {
    return Api.post('/api/retakeSession', data)
  },

  // Cập nhật đợt đăng ký học lại
  updateRetakeSession(id, data) {
    return Api.put(`/api/retakeSession/${id}`, data)
  },

  // Xóa đợt đăng ký học lại
  deleteRetakeSession(id, params) {
    return Api.delete(`/api/retakeSession/${id}`, { params })
  },

  changeStatusSession(id, data) {
    return Api.put(`/api/retakeSession/${id}`, data)
  }
}