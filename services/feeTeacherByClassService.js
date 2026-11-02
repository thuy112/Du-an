import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/decisionTeacherJobFee/byClass', params)
  },
  getRetakeSessions(params) {
    return Api.get('/api/retakeCourse/short', { params })
  },
  getExamList(params) {
    return Api.get('/api/exam/allExam', { params })
  },
  getTeachers(params) {
    return Api.get('/api/teacher/list', { params })
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', { params })
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', { params })
  },
  exportExcel(params) {
    return Api.getBlob('/api/decisionTeacherJobFee/export-excel/TeacherByClass/list', {
      params,
    })
  },
  async changeStatus(id, paymentFeeStatus) {
    return await Api.put(`/api/decisionTeacherJobFee/byClass/${id}/status`, {
      paymentFeeStatus,
      channel: 'CMS'
    })
  },
  async getDetail(id, params = {}) {
    return await Api.get(`/api/decisionTeacherJobFee/byClass/detail/${id}`, {
      channel: 'CMS',
      ...params
    })
  },

  async updateFile(id, formData) {
    return await Api.put(`/api/decisionTeacherJobFee/byClass/${id}/file-inform`, formData)
  }
}