import Api from '~/api/Api'

export default {
  // Lấy danh sách kết quả thi (API chính)
  getList(params) {
    return Api.get('/api/result', params)
  },
  // Lấy danh sách kỳ thi cho bộ lọc
  getExamList(params) {
    return Api.get('/api/exam/list1', params)
  },
  getTermList(examId, channel = 'CMS') {
    return Api.get('/api/term/listForRegister', { params: { examId, channel } })
  },
  // Lấy danh sách phòng thi theo học phần / kỳ thi
  getRoomList(subjectId, channel = 'CMS') {
    return Api.get('/api/roomExam/list', { params: { subjectId, channel } })
  },
}