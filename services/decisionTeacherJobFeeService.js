import Api from "~/api/Api";

export default {
  getList(params) {
    return Api.get('/api/decisionTeacherJobFee', params)
  },
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/decisionTeacherJobFee/${id}`, { params: { channel } })
  },
  getSemesterList(params) {
    return Api.get('/api/semester/list', params)
  },
  createItem(data, channel = 'CMS') {
    return Api.post('/api/decisionTeacherJobFee', data, { params: { channel } })
  },
  updateItem(id, data, channel = 'CMS') {
    return Api.put(`/api/decisionTeacherJobFee/${id}`, data, { params: { channel } })
  },
  changeStatus(id, data, channel = 'CMS') {
    return Api.put(`/api/decisionTeacherJobFee/changeStatus/${id}`, data, { params: { channel } })
  },
  // Xóa chuẩn theo cấu trúc Api wrapper
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/decisionTeacherJobFee/${id}`, { params: { channel } })
  },
  deleteDecision(id, channel = 'CMS') {
    return Api.delete(`/api/decisionTeacherJobFee/${id}`, { params: { channel } })
  },
  createDecision(data, channel = 'CMS') {
    return Api.post('/api/decisionTeacherJobFee', data, { params: { channel } })
  },
  getTermList(params) {
    return Api.get('/api/term/list', params)
  },
  exportExcel(id, channel = 'CMS') {
    return Api.get('/api/decisionTeacherJobFee/export', {
      params: { decisionTeacherJobFeeId: id, channel },
      responseType: 'blob'
    })
  },
  // Các hàm phụ trợ cho trang chi tiết định mức
  getTeacherList(params) {
    return Api.get('/api/teacher/list', params)
  },
  getExamList1(params) {
    return Api.get('/api/exam/list1', params)
  },
  getExamSessionList(params) {
    return Api.get('/api/examSession/list', { params })
  },
  getPerformance(params) {
    return Api.get('/api/decisionTeacherJobFee/performance', { params })
  },
  getExcelTemplate(id, channel = 'CMS') {
    return Api.get('/api/decisionTeacherJobFee/template', {
      params: { decisionTeacherJobFeeId: id, channel },
      responseType: 'blob'
    })
  },
  getTemplate(params) {
    return Api.get('/api/decisionTeacherJobFee/template', { params })
  },
  // Kiểm tra file excel trước khi import
  checkImport(formData, channel = 'CMS') {
    return Api.post('/api/decisionTeacherJobFee/import/check', formData, { 
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // Thực hiện import file excel chính thức
  confirmImport(formData, channel = 'CMS') {
    return Api.post('/api/decisionTeacherJobFee/import', formData, { 
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}