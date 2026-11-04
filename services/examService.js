import Api from '~/api/Api'

export default {
  // Lấy danh sách kỳ đăng ký thi lại
  getExamList(params) {
    return Api.get('/api/exam', params)
  },

  // Thêm mới kỳ thi
  createExam(data, channel = 'CMS') {
    return Api.post('/api/exam', data, { params: { channel } })
  },

  // Cập nhật kỳ thi
  updateExam(id, data, channel = 'CMS') {
    return Api.put(`/api/exam/${id}`, data, { params: { channel } })
  },

  // Xóa kỳ thi
  deleteExam(id, channel = 'CMS') {
    return Api.delete(`/api/exam/${id}`, { params: { channel } })
  },

  // Đổi trạng thái kỳ thi
  changeExamStatus(id, data, channel = 'CMS') {
    return Api.put(`/api/exam/changeStatus/${id}`, data, { params: { channel } })
  },

  // Lấy danh sách học kỳ (để chọn trong form Thêm/Sửa)
  getSemesterList(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return Api.get('/api/semester/list', params)
  },

  getPageRole(params = { channel: 'CMS' }) {
    return Api.get('/api/auth/getPageRole', params)
  },

  getUserInfo(params = { channel: 'CMS' }) {
    return Api.get('/api/user/info', params)
  },

  // Lấy chi tiết kỳ thi (chỉ giữ lại 1 hàm duy nhất dùng GET)
  getExamDetail(id, channel = 'CMS') {
    return Api.get(`/api/exam/detail/${id}`, {
      params: { channel }
    })
  }
}