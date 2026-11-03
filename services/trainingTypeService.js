import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/trainingType',params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole',params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info',params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/trainingType/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
}