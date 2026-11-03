import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/authorizeRegistration', params)
  },
  getSemesters(params) {
    return Api.get('/api/semester/list', params)
  },
  getExams(params) {
    return Api.get('/api/exam/list1', params)
  },
  getTerms(params) {
    return Api.get('/api/term/list', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  // --- Bổ sung các API cho popup Thêm mới sinh viên ---
  getStudents(params) {
    return Api.get('/api/student', params)
  },
  getRegisterClasses(params) {
    return Api.get('/api/registerClass/list', params) // Hoặc thay đổi đường dẫn endpoint lấy lớp đăng ký thực tế của bạn nếu khác
  }
}