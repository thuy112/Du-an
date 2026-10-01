//Phục vụ các nghiệp vụ tra cứu, đăng ký phía client/sinh viên.
import Api from '~/api/Api'

export default {
  getAvailableCourses(params) {//Danh sách lớp học lại có thể đăng ký của sinh viên.
    return Api.get('/api/v1/client/retake-courses', { params })
  },

  registerCourse(data) {//Đăng ký học lại của sinh viên.
    return Api.post('/api/v1/client/retake-courses/register', data)
  },

  cancelRegistration(id) {//Hủy đăng ký học lại của sinh viên.
    return Api.delete(`/api/v1/client/retake-courses/register/${id}`)
  },

  getStudentHistory(params) {//Lịch sử đăng ký học lại của sinh viên.
    return Api.get('/api/v1/client/retake-courses/history', { params })
  },
}