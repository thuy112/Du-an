import Api from '~/api/Api'

export default {
  getByClass(params) {
    return Api.get('/api/decisionTeacherJobFee/byClass',params)
  },

  // Thêm API chuyên biệt khi lọc theo lớp học lại
  getListByClass(params) {
    return Api.get('/api/teacher/rc/listByClass',params)
  },

  getRetakeCourse(params) {
    return Api.get('/api/retakeCourse',params)
  },

  getAllExam(params) {
    return Api.get('/api/exam/allExam',params)
  },

  getTeacherList(params) {
    return Api.get('/api/teacher/list',params)
  },

  getPageRole(params) {
    return Api.get('/api/auth/getPageRole',params)
  },

  getUserInfo(params) {
    return Api.get('/api/user/info',params)
  },
}