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

  // Hàm gán giảng viên cho lớp học lại
  assignTeacher(classId, data) {
    return Api.put(`/api/retakeCourse/${classId}/assign-teacher`, data)
  },
  
  assignTeacherToCourse(data) {
    return Api.put('/api/retakeCourse/teacher', data) 
  },

  // THÊM MỚI HÀM NÀY ĐỂ GỌI ĐÚNG API ĐỔI TRẠNG THÁI DUYỆT LỚP HỌC LẠI
  changeStatusCourse(id, data) {
    return Api.put(`/api/retakeCourse/changeRetakeCourseStatus/${id}`, data)
  },
}