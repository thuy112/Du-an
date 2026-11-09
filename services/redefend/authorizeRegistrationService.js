import Api from '@/api/Api'

export default {
  getList(params) {
    return Api.get('/api/redefense/authorizeRegistration',params)
  },
  
  delete(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/authorizeRegistration/${id}`, { params: { channel } })
  },
  
  getSemesters(params) {
    return Api.get('/api/semester/list',params)
  },
  
  getExams(params) {
    return Api.get('/api/redefense/exam/list',params)
  },

  getStudents(params) {
    return Api.get('/api/student',params)
  },

  createAuthorizeRegistration(data, channel = 'CMS') {
    return Api.post('/api/redefense/authorizeRegistration', data, { params: { channel } })
  },
  export(params) {
    return Api.get(`api/redefense/authorizeRegistration/export`, params);
  },
  // Tải file mẫu
  getTemplateFile(params) {
    return Api.get('/api/redefense/authorizeRegistration/template', { 
      params, 
      responseType: 'blob' 
    })
  },

  // Check file trước khi import
  checkImportFile(formData, channel = 'CMS') {
    return Api.post('/api/redefense/authorizeRegistration/import/check', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Lưu file sau khi check thành công
  confirmImportFile(formData, channel = 'CMS') {
    return Api.post('/api/redefense/authorizeRegistration/import', formData, {
      params: { channel },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}