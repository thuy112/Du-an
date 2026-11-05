import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/redefense/decisionFee', params)
  },
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/redefense/decisionFee/${id}`, { params: { channel } })
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
  getTrainingMethodList(params) {
    return Api.get('/api/trainingMethod/list', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/redefense/decisionFee/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/decisionFee/${id}`, { data: { channel } })
  },
  async exportExcel(decisionFeeId, channel = 'CMS') {
    return await Api.get('/api/redefense/decisionFee/export', 
      { decisionFeeId, channel }, // Tham số query truyền lên URL
      { responseType: 'blob' }    // Config cấu hình nhận file blob
    )
  },
  updateItem(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/decisionFee/${id}`, data, {
      params: { channel }
    })
  },
  // 1. Tải file mẫu template
  downloadTemplate(channel = 'CMS') {
    return Api.get('/api/redefense/decisionFee/template', { params: { channel }, responseType: 'blob' })
  },

  // 2. Kiểm tra file trước khi import
  importCheck(formData) {
    return Api.post('/api/redefense/decisionFee/import/check', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 3. Import file chính thức
  importFile(formData) {
    return Api.post('/api/redefense/decisionFee/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
}