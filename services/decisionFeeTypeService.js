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
  createItem(data, channel = 'CMS') {
    return Api.post('/api/decisionFee', data, { params: { channel } })
  },
  updateItem(id, data, channel = 'CMS') {
    return Api.put(`/api/decisionFee/${id}`, data, { params: { channel } })
  },
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/decisionFee/${id}`, { data: { channel } })
  },
  downloadTemplate(channel = 'CMS') {
    return Api.get('/api/decisionFee/template', { params: { channel }, responseType: 'blob' })
  },
  // Kiểm tra file excel trước khi import
  checkImportFile(formData, channel = 'CMS') {
    return Api.post('/api/decisionFee/import/check', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // Thực hiện import file chính thức
  importFile(formData, channel = 'CMS') {
    return Api.post('/api/decisionFee/import', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}