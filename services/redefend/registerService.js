import Api from '@/api/Api'

export default {
  // Lấy danh sách sinh viên đăng ký bảo vệ lại
  getList(params) {
    return Api.get('/api/redefense/register',params)
  },

  // Danh mục đợt bảo vệ
  getExams(params) {
    return Api.get('/api/redefense/exam/list',params)
  },

  // Danh mục lớp sinh viên
  getClasses(params) {
    return Api.get('/api/classes/all',params)
  },

  // Xuất file kết quả cấn thu
  exportFile(params) {
    return Api.get('/api/redefense/register/export', { 
      params, 
      responseType: 'blob' 
    })
  },

  // Xuất file đăng ký của 1 sinh viên (trong menu 3 chấm)
  exportOne(id, params) {
    return Api.get(`/api/redefense/register/export/${id}`, { 
      params, 
      responseType: 'blob' 
    })
  },

  // Duyệt tín chỉ
  approve(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/register/approve/${id}`, data, { params: { channel } })
  },

  // Từ chối đơn
  reject(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/register/reject/${id}`, data, { params: { channel } })
  },

  // Xóa đơn đăng ký
  delete(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/register/${id}`, { params: { channel } })
  }
}