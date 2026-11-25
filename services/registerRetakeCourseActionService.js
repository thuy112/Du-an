import Api from '~/api/Api'

export default {
  // Danh sách đăng ký & chi tiết
  getList(params) {
    return axios.$get('/api/registerRetakeCourse', { params })
  },
  getDetail(id, params = { channel: 'CMS' }) {
    return axios.$get(`/api/registerRetakeCourse/${id}`, { params })
  },
  updateRegistration(id, payload) {
    return axios.$put(`/api/registerRetakeCourse/${id}`, payload)
  },
  getAvailableExamSessions(id, params = { channel: 'CMS' }) {
    return axios.$get(`/api/registerRetakeCourse/availableExamSessions/${id}`, { params })
  },
  confirmRegistrationForm(id, payload) {
    return axios.$put(`/api/registerRetakeCourse/confirmRegistrationForm/${id}`, payload)
  },

  // Danh mục lọc
  getRetakeSessions(params = { channel: 'CMS' }) {
    return axios.$get('/api/retakeSession/list', { params })
  },
  getTerms(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return axios.$get('/api/term/list', { params })
  },
  getMajors(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return axios.$get('/api/major/list', { params })
  },
  getClasses(params = { channel: 'CMS' }) {
    return axios.$get('/api/classes/all', { params })
  },
  getRetakeCourses(params = { pageIndex: 1, pageSize: 100, channel: 'CMS' }) {
    return axios.$get('/api/retakeCourse', { params })
  },

  // Xuất file Excel
  exportRequiredFee(params) {
    return axios.$get('/api/registerRetakeCourse/export', {
      params,
      responseType: 'blob',
    })
  },
  exportNotPaid(params) {
    return axios.$get('/api/registerRetakeCourse/export-not-paid', {
      params,
      responseType: 'blob',
    })
  },
  exportFeePreview(params) {
    return axios.$get('/api/registerRetakeCourse/export-fee-preview', {
      params,
      responseType: 'blob',
    })
  },

  // Gửi danh sách thu phí & Gia hạn hạn nộp
  validateSameBatch(params) {
    return axios.$get('/api/payment/retake-course/validate-same-batch', { params })
  },
  validateExtendSameBatch(payload) {
    return axios.$post('/api/payment/retake-course/validate-extend-same-batch', payload)
  },
  extendDeadline(payload) {
    return axios.$post('/api/payment/retake-course/extend-deadline', payload)
  },
}