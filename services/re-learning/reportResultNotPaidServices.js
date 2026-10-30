import Api from '~/api/Api'

export default {
  // API chính lấy danh sách sinh viên chưa nộp tiền
  getResultNotPaid(params) {
    return Api.get('/api/report/resultNotPaid', params )
  },

  // API xuất file báo cáo (trả về kiểu blob để tải xuống file Excel/PDF)
  exportResultNotPaid(params) {
    return Api.get('/api/report/exportResultNotPaid', { 
      params,
      responseType: 'blob' // Bắt buộc để tải file dạng nhị phân
    })
  },

  // API phụ lấy danh sách đợt học lại
  getRetakeSession(params) {
    return Api.get('/api/retakeSession', params )
  },

  // API phụ lấy thông tin user hiện tại
  getUserInfo(params) {
    return Api.get('/api/user/info', params )
  },

  // API phụ lấy quyền phân vai trò trang
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params )
  },
}