import Api from '~/api/Api'

export default {
  // Lấy danh sách khoản thu (Có phân trang, tìm kiếm, lọc hình thức đào tạo, loại hình đào tạo/phân hệ)
  getRevenueList(params) {
    return Api.get('/api/revenue/list', params)
  },

  // Lấy danh sách hình thức đào tạo (dùng cho bộ lọc)
  getTrainingMethodList(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return Api.get('/api/trainingMethod/list', params)
  },

  // Các API phụ
  getPageRole(params = { channel: 'CMS' }) {
    return Api.get('/api/auth/getPageRole', params)
  },

  getUserInfo(params = { channel: 'CMS' }) {
    return Api.get('/api/user/info', params)
  }
}