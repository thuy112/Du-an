import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/educationProgram', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/educationProgram/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  exportTerm(id, channel = 'CMS') {
    return Api.get(`/api/educationProgram/exportTerm/${id}`, {
      params: { educationProgramId: id, channel },
      responseType: 'blob' // Xử lý nhận file tải về nếu cần
    })
  }
}