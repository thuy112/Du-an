import Api from '~/api/Api.js'

class PaymentTeacherByExamServices {
  // API chính: Lấy danh sách thanh toán theo đợt
  async getListExam(params) {
    return await Api.get('/decisionTeacherJobFee/byExam', params)
  }

  // API phụ 1: Lấy danh sách lớp học lại
  async getRetakeCourseList(params) {
    return await Api.get('/retakeCourse', params)
  }

  // API phụ 2: Lấy danh sách giảng viên
  async getTeacherList(params) {
    return await Api.get('/teacher/list', params)
  }

  // API phụ 3: Lấy danh sách lớp theo giảng viên
  async getTeacherClassList(params) {
    return await Api.get('/decisionTeacherJobFee/rc/teacher-class', params)
  }
}

export default new PaymentTeacherByExamServices()