// Xử lý đăng ký lớp học lại của sinh viên.
import Api from '~/api/Api'

export default {
  // Lấy danh sách đăng ký học lại kèm bộ lọc và phân trang
  getList(params) {
    return Api.get('/api/registerRetakeCourse', { params })
  },

  // Lấy chi tiết một đơn đăng ký theo ID
  getDetail(id, params) {
    return Api.get(`/api/registerRetakeCourse/${id}`, { params })
  },

  // Lấy danh sách lớp học và giáo viên khả dụng cho đơn đăng ký
  getAvailableExamSessions(id, params) {
    return Api.get(`/api/registerRetakeCourse/availableExamSessions/${id}`, { params })
  },

  // Xác nhận trạng thái đơn (Duyệt / Từ chối / Đặt lại chờ xác nhận)
  confirmRegistrationForm(id, data) {
    return Api.put(`/api/registerRetakeCourse/confirmRegistrationForm/${id}`, data)
  },

  // Cập nhật thông tin đơn đăng ký học lại
  update(id, data) {
    return Api.put(`/api/registerRetakeCourse/${id}`, data)
  },

  // Gửi email thông báo được phép đóng phí học lại
  sendMailFee(params) {
    return Api.get('/api/registerRetakeCourse/mailFee', { params })
  },
  // Gửi email thông báo từ chối đăng ký học lại
  sendMailRefused(params) {
    return Api.get('/api/registerRetakeCourse/mailRefused', { params })
  },
  // Ví dụ trong file service (hoặc registerRetakeCourseServices.js)
validatePaymentBatch(params) {
  return Api.get('/api/payment/retake-course/validate-same-batch', { params })
},
sendPaymentFeeList(data) {
  return Api.post('/api/payment/retake-course/send', data)
},
}