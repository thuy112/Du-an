import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/decisionFee', params)
  },
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/decisionFee/${id}`, { params: { channel } })
  },
  getSemesterList(params) {
    return Api.get('/api/semester/list', params)
  },
  getMajorList(params) {
    return Api.get('/api/major/list', params)
  },
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/decisionFee/${id}`, { data: { channel } })
  },
  uploadFile(formData, channel = 'CMS') {
    return Api.post('/api/file/upload', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  downloadTemplate(channel = 'CMS') {
    return Api.get('/api/decisionFee/template', { params: { channel }, responseType: 'blob' })
  },
  checkImportFile(formData, channel = 'CMS') {
    return Api.post('/api/decisionFee/import/check', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  importFile(formData, channel = 'CMS') {
    return Api.post('/api/decisionFee/import', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  createItem(params) {
    return Api.post("/api/decisionFee", params);
  },
  updateItem(id) {
    return Api.put(`/api/decisionFee/${id}`)
  },
}