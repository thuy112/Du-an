import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/decisionTeacherJobFee/byExam', params)
  },
  getDetail(id) {
    return Api.get(`/api/decisionTeacherJobFee/byExam/${id}`)
  },
  getTeachers(params) {
    return Api.get('/api/teacher/list', params)
  },
  getRetakeCourses(params) {
    return Api.get('/api/retakeCourse', params)
  },
  // API cập nhật trạng thái đúng theo link bạn gửi: /api/decisionTeacherJobFee/byExam/{id}/status
  updateStatus(id, params) {
    return Api.put(`/api/decisionTeacherJobFee/byExam/${id}/status`, params)
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
  createDecisionV2(params) {
    return Api.post('/api/decisionTeacherJobFee/byExamV2', params)
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