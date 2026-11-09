import Api from "~/api/Api";

export default {
  getExamSessionList(params) {
    return Api.get('/api/examSession/list', params);
  },
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/decisionTeacherJobFee/${id}`, { params: { channel } });
  },
  getTeacherList(params) {
    return Api.get('/api/teacher/list', params);
  },
  // Sử dụng đúng API /api/exam/list1 cho danh sách kỳ thi
  getExamList1(params) {
    return Api.get('/api/exam/list1', params);
  },
  getPerformance(params) {
    return Api.get('/api/decisionTeacherJobFee/performance', params);
  }
};