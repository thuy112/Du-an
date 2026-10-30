import Api from '~/api/Api'

export default {
  getReportResult(params) {
    return Api.get('/api/report/result',params)
  },
  getExamList(params) {
    return Api.get('/api/retakeSession/exam-list',params)
  }
}