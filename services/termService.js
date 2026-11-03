import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/term/', params)
  },
  getMajorList(params) {
    return Api.get('/api/major/list', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/term/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  }
}