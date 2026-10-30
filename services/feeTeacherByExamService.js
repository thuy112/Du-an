import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/decisionTeacherJobFee/byExam', params)
  },
  getDetail(id) {
    return Api.get(`/api/decisionTeacherJobFee/byExam/${id}`)
  },
  // Bổ sung hàm lấy danh sách giảng viên cho ô lọc (API số 3)
  getTeachers(params) {
    return Api.get('/api/teacher/list', params)
  },
  // Bổ sung hàm lấy danh sách đợt học lại cho ô lọc (API số 2)
  getRetakeCourses(params) {
    return Api.get('/api/retakeCourse', params)
  },
  exportExcelSummary(id) {
    return Api.get('/api/decisionTeacherJobFee/export-excel/summary', { id }, { responseType: 'blob' })
  },
  exportExcelDetail(id) {
    return Api.get('/api/decisionTeacherJobFee/export-excel/detail', { id }, { responseType: 'blob' })
  },
  exportExcelCompact(id) {
    return Api.get('/api/decisionTeacherJobFee/export-excel/shorten', { id }, { responseType: 'blob' })
  },
  exportExcelShorten(id) {
    return Api.get('/api/decisionTeacherJobFee/export-excel/shorten', { id }, { responseType: 'blob' })
  },
  getTeacherClass(params) {
    return Api.get('/api/decisionTeacherJobFee/rc/teacher-class', params)
  },
  getListByClass(params) {
    return Api.get('/api/teacher/rc/listByClass', params)
  },
  deleteItem(id) {
    return Api.delete(`/api/decisionTeacherJobFee/byExam/${id}`)
  },
  sendEmailNotification(id) {
    return Api.post(`/api/decisionTeacherJobFee/send-mail/${id}`)
  }, 
  exportResult(params) {
    return Api.get("/api/report/exportResult", params);
  }
}