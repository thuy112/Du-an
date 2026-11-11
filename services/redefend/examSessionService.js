import Api from "~/api/Api";

export default {
  // Lấy danh sách hội đồng bảo vệ (API chính)
  getList(params) {
    return Api.get('/api/redefense/examSession',params)
  },
  // Lấy chi tiết hội đồng
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/redefense/examSession/${id}`, { params: { channel } })
  },
  // Thêm mới hội đồng
  createItem(data, channel = 'CMS') {
    return Api.post('/api/redefense/examSession', data, { params: { channel } })
  },
  // Cập nhật hội đồng
  updateItem(id, data, channel = 'CMS') {
    return Api.put(`/api/redefense/examSession/${id}`, data, { params: { channel } })
  },
  // Xóa hội đồng
  deleteItem(id, channel = 'CMS') {
    return Api.delete(`/api/redefense/examSession/${id}`, { params: { channel } })
  },
  // API phụ: Lấy danh sách đợt bảo vệ
  getExamList(params) {
    return Api.get('/api/redefense/exam/list',params)
  },
  // API phụ: Lấy danh sách lớp / học phần
  getClassList(params) {
    return Api.get('/api/classes/all',params)
  },
  // API phụ: Lấy danh sách học kỳ (nếu cần dùng)
  getTermList(params) {
    return Api.get('/api/term/list',params)
  },
  getStudentsByExamSession(params) {
    return Api.get('/api/redefense/register/studentByExamSession/detail',params)
  },
  exportExcel(id, channel) {
    return Api.get(`/api/redefense/examSession/exportExcel/${id}`, { params: { channel }, responseType: 'blob' })
  },
  sendEmailResult(id, channel) {
    return Api.post(`/api/redefense/examSession/mail/result/${id}`, null, { params: { channel } })
  },
  // Lấy chi tiết 1 hội đồng theo ID
  getExamSessionDetail(id, channel) {
    return Api.get(`/api/redefense/examSession/${id}`, { params: { channel } })
  },
  // Lấy danh sách hình thức đào tạo
  getTrainingMethodList(params) {
    return Api.get('/api/trainingMethod/list',params)
  },
  // Lấy danh sách học phần theo đợt bảo vệ
  getTermListByExam(params) {
    return Api.get('/api/term/redefense/listByExam',params)
  },
  // Lấy danh sách sinh viên theo môn và đợt bảo vệ
  getRegisterListByTermAndExam(params) {
    return Api.get('/api/redefense/register/list-by-term-and-exam',params)
  },
  // Cập nhật hội đồng (PUT /api/redefense/examSession/{id})
  updateExamSession(id, data, channel) {
    return Api.put(`/api/redefense/examSession/${id}`, data, { params: { channel } })
  },
  getResultList(params) {
    return Api.get('/api/redefense/result', params) 
  },

  // Lấy template import bảng điểm (phụ)
  getResultTemplate(channel) {
    return Api.get('/api/redefense/result/template', { params: { channel } })
  },
  getResultDetail(id, channel) {
    return Api.get(`/api/redefense/result/${id}`, { params: { channel } })
  },

  // Cập nhật kết quả điểm (dùng khi bấm Lưu ở modal sửa)
  updateResult(id, data, channel) {
    return Api.put(`/api/redefense/result/${id}`, data, { params: { channel } })
  },
  update(params) {
    return Api.put(`/api/redefense/result/${params.id}`, params, { params: { channel: params.channel || 'CMS' } })
  },
  checkImportTranscript(examSessionId, file) {
    const form = new FormData();
      form.append("file", file);
      return Api.postMultipart(`/api/redefense/result/import/${examSessionId}/check`, form);
  },

  importTranscript(examSessionId, data) {
    return Api.post(`/api/redefense/result/import/${examSessionId}`, {
      examResultImports: [...data],
    });
  },

  // === BỔ SUNG CHO MÀN HÌNH GÁN GIẢNG VIÊN ===
  getTeacherList(params) {
    return Api.get('/api/teacher/list',params)
  },
  getStudentAssignTeacher(params) {
    return Api.get('/api/redefense/studentAssignTeacher',params)
  },
  createStudentAssignTeacher(data, channel = 'CMS') {
    return Api.post('/api/redefense/studentAssignTeacher', data, { params: { channel } })
  }
}