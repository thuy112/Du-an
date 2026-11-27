// Quản lý đợt, kỳ học lại & lớp học lại.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/retakeSession/list',params )
  },

  getRetakeSessions(params) {
    return Api.get('/api/retakeSession/list',params )
  },

  getAll(params) {
    return Api.get("/api/retakeSession/list", params);
  },

  getDetail(id) {
    return Api.get(`/api/retakeSession/${id}`)
  },

  create(data) {
    return Api.post('/api/retakeSession', data)
  },

  update(params) {
    return Api.put(`/api/retakeSession/${params.id}`, params);
  },

  delete(id, params) {
    return Api.delete(`/api/retakeSession/${id}`,params )
  },

  exportExcel(params) {
    return Api.getBlob('/api/retakeSession/export',params )
  },

  assignTeacher(classId, data) {
    return Api.put(`/api/retakeCourse/${classId}/assign-teacher`, data)
  },

  assignTeacherToCourse(data) {
    return Api.put('/api/retakeCourse/teacher', data)
  },

  changeStatusCourse(id, data) {
    return Api.put(`/api/retakeCourse/changeRetakeCourseStatus/${id}`, data)
  },

  getRetakeCourses(params) {
    return Api.get('/api/retakeCourse',params )
  },

  getCoefficients(params) {
    return Api.get('/api/coefficient',params )
  },

  getAllClasses(params) {
    return Api.get('/api/classes/all',params )
  },

  addNew(params) {
    return Api.post("/api/retakeSession", params)
  },

  changeStatus(params) {
    return Api.put(`/api/retakeSession/changeStatus/${params.id}`, params)
  },

  export(params) {
    return Api.get(`/api/retakeSession/export`, params)
  },

  import(data) {
    const file = new FormData();
    file.append("file", data);
    return Api.get(`/api/retakeSession/import`, file);
  },

  getListRegisterRetakeSession(params) {
    return Api.get("/api/retakeSession/exam-list", params);
  },

  setDeadline(params) {
    return Api.put(`/api/retakeSession/changePaymentToTime/${params.id}`, {
      date: params.date,
    });
  },
  
  getSemesters(params) {
    return Api.get('/api/semester/list', params)
  },

  getRetakeCourseAuthList(params) {
    return Api.get('/api/retakeCourseAuthList', params)
  },

  getRetakeCourseAuthDetail(id, params) {
    return Api.get(`/api/retakeCourseAuthList/detail/${id}`, params)
  },

  deleteRetakeCourseAuth(id, params) {
    return Api.delete(`/api/retakeCourseAuthList/${id}`, params)
  },
}