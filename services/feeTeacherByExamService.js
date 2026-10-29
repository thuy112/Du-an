export default {
  getList(params, $axios) {
    return $axios.$get('/api/decisionTeacherJobFee/byExam', { params })
  },
  getRetakeCourses(params, $axios) {
    return $axios.$get('/api/retakeCourse', { params })
  },
  getTeachers(params, $axios) {
    return $axios.$get('/api/teacher/list', { params })
  },
  getTeacherClass(params, $axios) {
    return $axios.$get('/api/decisionTeacherJobFee/rc/teacher-class', { params })
  },
  getPageRole(params, $axios) {
    return $axios.$get('/api/auth/getPageRole', { params })
  },
  getUserInfo(params, $axios) {
    return $axios.$get('/api/user/info', { params })
  },
  getTeacherListByClass(params, $axios) {
    return $axios.$get('/api/teacher/rc/listByClass', { params })
  },
  createDecision(data, $axios) {
    return $axios.$post('/api/decisionTeacherJobFee/byExamV2', data)
  },
}