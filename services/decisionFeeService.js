import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/redefense/decisionFee', params)
  },
  createItem(data, channel = 'CMS') {
    return Api.post('/api/redefense/decisionFee', data, {
      params: { channel }
    })
  },
  getSemesterList(params) {
    return Api.get('/api/semester/list', params)
  },
  getMajorList(params) {
    return Api.get('/api/major/list', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/redefense/decisionFee/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/decisionFee/${id}`, { data: { channel } })
  }
}