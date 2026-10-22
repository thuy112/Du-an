import Api from '~/api/Api.js'

export default {
  // Lấy thông tin tài khoản đang đăng nhập[cite: 1, 6]
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },

  // Kiểm tra quyền trang[cite: 1, 6]
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },

  // Lấy danh sách sinh viên
  getStudents(params) {
    return Api.get('/api/student', params)
  },

  // Lấy danh sách lớp[cite: 1]
  getClasses(params) {
    return Api.get('/api/classes/list', params)
  },

  // Lấy danh sách hình thức đào tạo[cite: 1]
  getTrainingMethods(params) {
    return Api.get('/api/trainingMethod/list', params)
  },

  // Lấy danh sách khóa học[cite: 1]
  getCourses(params) {
    return Api.get('/api/course/all', params)
  },

  // Lấy danh sách học phần[cite: 1]
  getTerms(params) {
    return Api.get('/api/term/list', params)
  },
}