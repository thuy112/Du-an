import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/redefense/decisionFee', params)
  },
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/redefense/decisionFee/${id}`, { channel })
  },
  add(data) {
    return Api.post('/api/redefense/decisionFee', data)
  },
  createItem(data, channel = 'CMS') {
    return Api.post('/api/redefense/decisionFee', data, { channel })
  },
  update(data) {
    const id = data?.id
    return Api.put(`/api/redefense/decisionFee/${id}`, data)
  },
  updateItem(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/decisionFee/${id}`, data, { channel })
  },
  getSemesterList(params) {
    return Api.get('/api/semester/list', params)
  },
  getMajorList(params) {
    return Api.get('/api/major/list', params)
  },
  getTrainingMethodList(params) {
    return Api.get('/api/trainingMethod/list', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/redefense/decisionFee/changeStatus/${id}`, { status, channel })
  },
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/decisionFee/${id}`, { data: { channel } })
  },
  async exportExcel(decisionFeeId, channel = 'CMS') {
    return await Api.get(
      '/api/redefense/decisionFee/export',
      { decisionFeeId, channel },
      { responseType: 'blob' }
    )
  },
  downloadTemplate(channel = 'CMS') {
    return Api.get('/api/redefense/decisionFee/template', { channel }, { responseType: 'blob' })
  },
  importCheck(formData) {
    return Api.post('/api/redefense/decisionFee/import/check', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  importFile(formData) {
    return Api.post('/api/redefense/decisionFee/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}