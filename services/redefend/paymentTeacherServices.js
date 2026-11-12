import Api from "~/api/Api.js";

export default {
     getList(params) {
        return Api.get("/api/redefense/paymentTeacher", params);
    },

     add(params) {
        return Api.post("/api/redefense/paymentTeacher", params);
    },

     getDetail(id) {
        return Api.get(`/api/redefense/paymentTeacher/${id}`);
    },

     update(params) {
        return Api.put(`/api/redefense/paymentTeacher`, params);
    },

     delete(id) {
        return Api.delete(`/api/redefense/paymentTeacher/${id}`);
    },

     changeStatus(data) {
        return Api.put("/api/redefense/paymentTeacher/status/" + data.id, data);
    },

     getTeachers(data) {
        return Api.get(`/api/redefense/paymentTeacher/teachers/${data.examSessionId}`);
    },

     getTemplate() {
        return Api.get("/api/redefense/paymentTeacher/templateImport");
    },

     import(data) {
        return Api.post("/api/redefense/paymentTeacher/import", data);
    },

     checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart("/api/redefense/paymentTeacher/import/check", form);
    },

     export(teacherPaymentId) {
        return Api.get("/api/redefense/paymentTeacher/export", {
            teacherPaymentId,
        });
    },

     exportStudentPaid(id) {
        return Api.get(`/api/redefense/paymentTeacher/export-student-paid/${id}`);
    },

     exportAll(param) {
        return Api.get("/api/redefense/paymentTeacher/exportv1", param);
    },

     exportAllV1(param) {
        return Api.get("/api/decisionTeacherJobFee/export-excel/TeacherByClass", param);
    },

     exportPaymentList(param) {
        return Api.get("/api/decisionTeacherJobFee/export-excel/TeacherByClass/list", param);
    },
     getTeacherList(params) {
        return Api.get("/api/teacher/list", params);
    },

     getExamSessionList(params) {
        return Api.get("/api/redefense/examSession/list", params);
    },
}
