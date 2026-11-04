import Api from '~/api/Api'

export default {
  // Lấy danh sách học kỳ
  getSemesterList(params) {
    return Api.get('/api/semester', params)
  },

  // Lấy chi tiết một học kỳ theo ID (dùng khi bấm nút Sửa)
  getSemesterDetail(id, channel = 'CMS') {
    return Api.get(`/api/semester/${id}`, { params: { channel } })
  },

  // Thêm mới học kỳ
  createSemester(data, channel = 'CMS') {
    return Api.post('/api/semester', data, { params: { channel } })
  },

  // Cập nhật học kỳ (PUT /api/semester/{id})
  updateSemester(id, data, channel = 'CMS') {
    return Api.put(`/api/semester/${id}`, data, { params: { channel } })
  },

  // Xóa học kỳ (DELETE /api/semester/{id})
  deleteSemester(id, channel = 'CMS') {
    return Api.delete(`/api/semester/${id}`, { params: { channel } })
  },

  // Đổi trạng thái học kỳ
  changeSemesterStatus(id, data, channel = 'CMS') {
    return Api.put(`/api/semester/changeStatus/${id}`, data, { params: { channel } })
  },

  // Các API phụ
  getPageRole(params = { channel: 'CMS' }) {
    return Api.get('/api/auth/getPageRole', params)
  },

  getUserInfo(params = { channel: 'CMS' }) {
    return Api.get('/api/user/info', params)
  }
}