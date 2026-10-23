import Api from '~/api/Api.js'

export default {
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getStudents(params) {
    return Api.get('/api/student', params)
  },
  updateStudentStatus(id, data) {
    return Api.put(`/api/student/${id}`, data)
  },
  getClasses(params) {
    return Api.get('/api/classes/list', params)
  },
  getTrainingMethods(params) {
    return Api.get('/api/trainingMethod/list', params)
  },
  getCourses(params) {
    return Api.get('/api/course/all', params)
  },
  getTerms(params) {
    return Api.get('/api/term/list', params)
  },
  // Thêm API lấy lịch sử học tập của sinh viên
  getStudentHistory(params) {
    return Api.get('/api/student/history', params)
  },
}