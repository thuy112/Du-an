import Api from '~/api/Api'

export default {
  // Lấy danh sách thanh toán cho giáo viên (API chính)
  getList(params) {
    return Api.get('/api/decisionTeacherJobFee', params)
  },
  // Lấy chi tiết bản ghi
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/decisionTeacherJobFee/${id}`, { params: { channel } })
  },
  // Lấy danh sách học kỳ (API phụ)
  getSemesterList(params) {
    return Api.get('/api/semester/list', params)
  },
  // Thêm mới
  createItem(data, channel = 'CMS') {
    return Api.post('/api/decisionTeacherJobFee', data, { params: { channel } })
  },
  // Cập nhật
  updateItem(id, data, channel = 'CMS') {
    return Api.put(`/api/decisionTeacherJobFee/${id}`, data, { params: { channel } })
  },
  // Đổi trạng thái trực tiếp
  changeStatus(id, data, channel = 'CMS') {
    return Api.put(`/api/decisionTeacherJobFee/changeStatus/${id}`, data, { params: { channel } })
  },
  // Xóa
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/decisionTeacherJobFee/${id}`, { data: { channel } })
  },
  getTermList(params) {
    return Api.get('/api/term/list', params)
  },
  exportExcel(id, channel = 'CMS') {
    return Api.get('/api/decisionTeacherJobFee/export', {
      params: { decisionTeacherJobFeeId: id, channel },
      responseType: 'blob' // Xử lý nhận file tải về
    })
  },
}