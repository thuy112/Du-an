import Api from '~/api/Api'

export default {
  getReportSynthetic(params) {
    return Api.get('/api/report/synthetic',params)
  },
  getExamList(params) {
    return Api.get('/api/retakeSession/exam-list',params)
  },
  // THÊM HÀM XUẤT FILE NÀY
  exportSynthetic(params) {
    return Api.get('/api/report/exportSynthetic', {
      params,
      responseType: 'blob',
    })
  }
}