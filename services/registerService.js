import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/register', params)
  },
  getCanRegisterStudents(params) {
    return Api.get('/api/student/canRegister', params)
  },
  getExams(params) {
    return Api.get('/api/exam/list1', params)
  },
  getClasses(params) {
    return Api.get('/api/classes/all', params)
  },
  getEstimationFee(params) {
    return Api.get('/api/decisionFee/estimation', params)
  },
  getTermsForRegister(params) {
    return Api.get('/api/term/listForRegister', params)
  },
  createRegister(data, channel = 'CMS') {
    return Api.post('/api/register', data, { params: { channel } })
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  sendMailFee(params) {
    return Api.get('/api/register/mailFee', { channel: 'CMS', ...params })
  },
  exportFileReport(params) {
    return Api.get('/api/register/export', { channel: 'CMS', ...params, responseType: 'blob' })
  },
  importCheckFile(formData) {
    return Api.post('/api/register/import/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { channel: 'CMS' }
    })
  },
  importFile(formData) {
    return Api.post('/api/register/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { channel: 'CMS' }
    })
  }
}