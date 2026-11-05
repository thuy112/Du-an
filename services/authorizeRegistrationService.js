import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/authorizeRegistration', params)
  },

  delete(id, channel = 'CMS') {
    return Api.delete(`/api/authorizeRegistration/${id}`, { params: { channel } })
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

  getStudents(params) {
    return Api.get('/api/student', params)
  },

  getRegisterClasses(params) {
    return Api.get('/api/registerClass/list', params)
  },

  // --- Các API Xuất file, Template, Check và Import ---
  exportReport(params) {
    return Api.get('/api/authorizeRegistration/export', params)
  },

  getTemplate(params) {
    return Api.get('/api/authorizeRegistration/template', params)
  },

  checkImportFile(formData, channel = 'CMS') {
    return Api.post('/api/authorizeRegistration/import/check', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  importFile(formData, channel = 'CMS') {
    return Api.post('/api/authorizeRegistration/import', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getExamSessions(params) {
    return Api.get('/api/authorizeRegistration/examSession', params)
  },
  createAuthorizeRegistration(data, channel = 'CMS') {
    return Api.post('/api/authorizeRegistration', data, { params: { channel } })
  }
}