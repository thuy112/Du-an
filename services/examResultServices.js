import Api from "~/api/Api.js";

export default {
  // Danh sách kết quả học lại (đúng path /api/RetakeCourseResult)
  getRetakeCourseResults(params) {
    return Api.get("/api/RetakeCourseResult", params);
  },

  // Các API danh mục theo danh sách URL bạn gửi
  getRetakeSessions(params = { status: "ACTIVE", channel: "CMS" }) {
    return Api.get("/api/retakeSession/list", params);
  },
  getClasses(params = { channel: "CMS" }) {
    return Api.get("/api/classes/all", params);
  },
  getCoefficients(params = { pageSize: 100, pageIndex: 1, channel: "CMS" }) {
    return Api.get("/api/coefficient", params);
  },
  getRetakeCourses(params = { pageSize: 100, pageIndex: 1, channel: "CMS" }) {
    return Api.get("/api/retakeCourse", params);
  },

  // Giữ nguyên các hàm có sẵn của bạn
  getList(params) {
    return Api.get("/api/result", params);
  },
  addNew(params) {
    return Api.post("/api/result", params);
  },
  getDetail(id) {
    return Api.get(`/api/result/${id}`);
  },
  update(params) {
    return Api.put(`/api/result/${params.id}`, params);
  },
  delete(id) {
    return Api.delete(`/api/result/${id}`);
  },
  checkImport(file) {
    const form = new FormData();
    form.append("file", file);
    return Api.postMultipart("/api/result/import/check", form);
  },
  import(data, examClass) {
    return Api.post("/api/result/import", { examResultImports: [...data], examClass });
  },
  export(params) {
    return Api.get("/api/result/export", params);
  },
  getTemplate() {
    return Api.get("/api/result/template");
  },
  closed(params) {
    return Api.get("/api/result/closed", params);
  },
  register(params) {
    return Api.get("/api/result/register", params);
  },
  getRetakeCourseResultByRegisterExam(params) {
    return Api.get("/api/RetakeCourseResult/byRegisterExam", params);
  },
};