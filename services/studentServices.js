import Api from '~/api/Api.js'

export default {
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getStudents(params) {
    return Api.get('/api/student', params)
  },
  changeStatus(data) {
    return Api.put(`/api/student/changeStatus/${data.id}`, data)
  },
  updateStudentStatus(id, data) {
    return Api.put(`/api/student/${id}`, data)
  },
  getClasses(params) {
    return Api.get('/api/classes/list', params)
  },
  getTrainingMethods(params) {
    return Api.get('/api/trainingMethod/list', params)
  },
  getCourses(params) {
    return Api.get('/api/course/all', params)
  },
  getTerms(params) {
    return Api.get('/api/term/list', params)
  },
  getStudentHistory(params) {
    return Api.get('/api/student/history', params)
  },

  getList(params) {
    return Api.get("/api/student", params);
  },

  getCanRegisterStudent(params) {
    return Api.get("/api/student/canRegister", params);
  },

  addNew(params) {
    return Api.post("student", params);
  },

  getDetail(id) {
    return Api.get(`/api/student/${id}`);
  },

  update(params) {
    return Api.put(`/api/student/${params.id}`, params);
  },

  delete(id) {
    return Api.delete(`/api/student/${id}`);
  },

  deleteMulti(ids) {
    return Api.post(`/api/student/deleteStudents`, ids);
  },

  checkImport(file) {
        const form = new FormData();
        form.append("file", file);
    return Api.postMultipart("/api/student/checkImport", form);
  },

  confirmImport(data) {
    return Api.post("/api/student/importExcel", data);
  },

  getTemplate() {
    return Api.get("api/student/templateImport");
  },

  export(params) {
    return Api.get("api/student/exportExcel", params);
  },

  getHistoryStudent(params) {
    return Api.get("api/student/history", params);
  },
}