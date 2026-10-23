import Api from '~/api/Api.js'

export default {
  // API chính để hiển thị danh sách giảng viên lên giao diện
  getTeachers(params) {
    return Api.get('/api/teacher', params)
  },

  // API cập nhật trạng thái giảng viên (Giữ lại duy nhất 1 hàm này)
  updateTeacherStatus(id, data) {
    return Api.put(`/api/teacher/${id}`, data)
  },

  // API phụ lấy danh sách đơn vị/khoa trường
  getWorkUnits(params) {
    return Api.get('/api/workUnit/list', params)
  },

  // API kiểm tra quyền trang
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },

  // API lấy thông tin người dùng đang đăng nhập
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },

  // Bổ sung hàm gán/cập nhật giảng viên cho lớp học lại
  assignTeacher(classId, data) {
    return Api.put(`/api/retakeSession/${classId}`, data)
  },
}