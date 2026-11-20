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

  getAll(params) {
    return Api.get("/api/registerRetakeCourse/list", params);
  },

  export(params) {
    return Api.get("/api/registerRetakeCourse/export", params);
  },

  exportNotPaid(params) {
    return Api.get("/api/registerRetakeCourse/export-not-paid", params);
  },

    // Xuất file rà soát học phí trước khi đẩy đơn sang CEDF thu phí
  exportFeePreview(params) {
    return Api.get("/api/registerRetakeCourse/export-fee-preview", params);
  },

  add(data) {
    return Api.post("/api/registerRetakeCourse", data);
  },

  delete(data) {
    return Api.delete("/api/registerRetakeCourse/" + data.id);
  },

  changeStatus(data) {
    return Api.put("/api/registerRetakeCourse/confirmRegistrationForm/" + data.id, data);
  },

  notifyEmail(data) {
    return Api.get("/api/registerRetakeCourse/mailFee", data);
  },

  refusedEmail(data) {
    return Api.get("/api/registerRetakeCourse/mailRefused", data);
  },

  confirmImport(data) {
    return Api.post("/api/registerRetakeCourse/import", data);
  },

  getListRetakeSession(params) {
    return Api.get("/api/exam/list2", params);
  },

  checkImport(data) {
    const file = new FormData();
    file.append("file", data);
    return Api.postMultipart("/api/registerRetakeCourse/import/check", file);
  },

    // @@@ Thêm các API cho 3 bước duyệt
  creditRegister(data) {
    return Api.post("/api/registerRetakeCourse/approve/credit", data);
  },

  tuitionFeeRegister(data) {
    return Api.post("/api/registerRetakeCourse/approve/tuitionFee", data);
  },

  studentRegister(data) {
    return Api.post("/api/registerRetakeCourse/approve/student", data);
  },

    // @@@ API bảng điểm
  getStudentByExamSession(params) {
    return Api.get("/api/registerRetakeCourse/studentByExamSession", params);
  },

    // API GET list update:
  getListRegisterExamTerm(id) {
    return Api.get("/api/registerRetakeCourse/listRegisterExamTerm/" + id);
  },

  getTemplate() {
    return Api.get("/api/registerRetakeCourse/template");
  },

  generateBatchQr(data) {
    return Api.post("/api/payment/retake-course/generate-batch-qr", data);
  },

  validateSameBatch(data) {
    return Api.post("/api/payment/retake-course/validate-same-batch", data);
  },

  extendDeadline(data) {
    return Api.post("/api/payment/retake-course/extend-deadline", data);
  },

  validateExtendSameBatch(data) {
    return Api.post("/api/payment/retake-course/validate-extend-same-batch", data);
  },
}