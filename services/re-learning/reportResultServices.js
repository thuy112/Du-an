import Api from '~/api/Api.js'

class ReportResultServices {
  async getReportResult(params) {
    return await Api.get('/report/result', { params })
  }

  async getExamList(params) {
    return await Api.get('/retakeSession/exam-list', { params })
  }

  async getUserInfo(params) {
    return await Api.get('/user/info', { params })
  }

  async getPageRole(params) {
    return await Api.get('/auth/getPageRole', { params })
  }
}

export default new ReportResultServices()