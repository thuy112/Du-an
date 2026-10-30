import Api from '~/api/Api'

const feeTeacherService = {
  // Lấy danh sách báo cáo thanh toán giảng viên (Màn hình chính)
  getByExam(params) {
    return Api.get('/api/decisionTeacherJobFee/byExam', params)
  },

  // Lấy danh sách giảng viên cho ô lọc
  getTeacherList(params) {
    return Api.get('/api/teacher/list', params)
  },

  // Lấy danh sách đợt học lại cho ô lọc
  getExamList(params) {
    return Api.get('/api/retakeSession', params)
  },

  // Lấy danh sách lớp học lại cho ô lọc
  getRetakeCourseList(params) {
    return Api.get('/api/retakeCourse', params)
  },

  // Xuất file báo cáo tổng hợp
  exportResult(params) {
    return Api.get('/api/report/exportResult', params)
  },
  // Xuất file Excel tổng hợp theo ID dòng
  exportExcelSummary(id) {
    return Api.get(`/api/decisionTeacherJobFee/export-excel/summary`, { id, channel: 'CMS' })
  },
}

export default feeTeacherService