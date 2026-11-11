import Api from '~/api/Api'

export default {
  // Lấy danh sách kết quả bảo vệ lại (Khớp với URL trên Network)
  getList(params) {
    return Api.get('/api/redefense/result', params)
  },
  // Lấy danh sách lớp
  getClasses(params) {
    return Api.get('/api/classes/all', params)
  },
  // Lấy template
  getTemplate(params) {
    return Api.get('/api/redefense/result/template', params)
  },
  // Lấy danh sách đợt bảo vệ
  getExamList(params) {
    return Api.get('/api/redefense/exam/list', params)
  },
  // Lấy danh sách hội đồng bảo vệ
  getExamSessionList(params) {
    return Api.get('/api/redefense/examSession/list', params)
  },
  checkImportFile(data) {
    return Api.post('/api/redefense/result/import/check', data)
  },
  // API Lưu file import chính thức
  importFile(data) {
    return Api.post('/api/redefense/result/import', data)
  }
}