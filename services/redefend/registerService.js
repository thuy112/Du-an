import Api from '@/api/Api'

export default {
  // Lấy danh sách sinh viên đăng ký bảo vệ lại
  getList(params) {
    return Api.get('/api/redefense/register', params)
  },

  // Danh mục đợt bảo vệ
  getExams(params) {
    return Api.get('/api/redefense/exam/list', params)
  },

  // Danh mục lớp sinh viên
  getClasses(params) {
    return Api.get('/api/classes/all', params)
  },

  // Xuất file kết quả cấn thu
  exportFile(params) {
    return Api.get('/api/redefense/register/export', { 
      params, 
      responseType: 'blob' 
    })
  },

  // Xuất file đăng ký của 1 sinh viên (trong menu 3 chấm)
  exportOne(id, params) {
    return Api.get(`/api/redefense/register/export/${id}`, { 
      params, 
      responseType: 'blob' 
    })
  },

  // Duyệt tín chỉ
  approve(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/register/approve/${id}`, data, { params: { channel } })
  },

  // Từ chối đơn
  reject(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/register/reject/${id}`, data, { params: { channel } })
  },

  // Xóa đơn đăng ký
  delete(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/register/${id}`, { params: { channel } })
  },

  // --- CÁC API BỔ SUNG CHO LUỒNG THÊM MỚI (ĐĂNG KÝ BẢO VỆ LẠI) ---

  // 1. Lấy danh sách sinh viên có thể đăng ký (hỗ trợ phân trang và tìm kiếm theo mã/tên)
  getCanRegisterStudents(params) {
    return Api.get('/api/student/redefense/canRegister', params)
  },

  // 2. Lấy thông tin chi tiết sinh viên khi chọn ở bước 1
  getStudentDetail(studentId, channel = 'CMS') {
    return Api.get('/api/redefense/exam/get-by-student', { params: { studentId, channel } })
  },

  // 3. Lấy danh sách học phần (dùng cho bước 2)
  getTermList(params) {
    return Api.get('/api/term/list', params)
  },

  // 4. Ước tính học phí dựa trên ngành và loại hình đào tạo
  estimateFee(params) {
    return Api.get('/api/redefense/decisionFee/estimation', params)
  },

  // 5. Lấy danh sách học phần đăng ký theo mã sinh viên, đợt và học phần
  listForRegister(params) {
    return Api.get('/api/term/redefense/listForRegister', params)
  },

  // 6. Gửi request tạo mới đăng ký bảo vệ lại (Nút Lưu)
  createRegistration(data, channel = 'CMS') {
    return Api.post('/api/redefense/register', data, { params: { channel } })
  },
  exportByCode(id, params) {
    return Api.get(`/api/redefense/register/export-by-code/${id}`, { 
      params, 
      responseType: 'blob' 
    })
  },
  // Duyệt học phí
  approveTuition(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/register/approve/tuition/${id}`, data, { params: { channel } })
  },
  // Hoặc nếu endpoint dùng chung dạng query / body truyền type, bạn trỏ đúng URL theo dự án:
  approveCredit(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/register/approve/credit/${id}`, data, { params: { channel } })
  },
  // Duyệt tín chỉ
  async creditRegister(data) {
    return await Api.post("/api/redefense/register/approve/credit", data);
  },

  // Duyệt học phí
  async tuitionFeeRegister(data) {
    return await Api.post("/api/redefense/register/approve/tuitionFee", data);
  },

  // Duyệt sinh viên
  async studentRegister(data) {
    return await Api.post("/api/redefense/register/approve/student", data);
  },
  async notifyEmail(data) {
    return await Api.get("/api/redefense/register/mailFee", data);
  },

  async notifyEmailRefuse(data) {
    return await Api.get("/api/redefense/register/mailRefused", data);
  }
}