// Quản lý đợt, kỳ học lại.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/retakeSession/list', { params })
  },

  getRetakeSessions(params) {
    return Api.get('/api/retakeSession/list', { params })
  },

  getDetail(id) {
    return Api.get(`/api/retakeSession/${id}`)
  },

  create(data) {
    return Api.post('/api/retakeSession', data)
  },

  update(id, data) {
    return Api.put(`/api/retakeSession/${id}`, data)
  },

  delete(id, params) {
    return Api.delete(`/api/retakeSession/${id}`, { params })
  },

  exportExcel(params) {
    return Api.getBlob('/api/retakeSession/export', { params })
  },

  // Thêm hàm gán giảng viên cho lớp học lại
  assignTeacher(classId, data) {
    return Api.put(`/api/retakeCourse/${classId}/assign-teacher`, data)
  },
  // Cập nhật gán giảng viên đúng chuẩn API của hệ thống
  assignTeacherToCourse(data) {
    return Api.put('/api/retakeCourse/teacher', data) 
    // Hoặc nếu backend dùng POST thì đổi thành Api.post('/api/retakeCourse/teacher', data)
  },
}