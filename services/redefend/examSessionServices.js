import Api from "~/api/Api.js";

// @@@ danh sách hội đồng
export default {
    getList(params) {
        return Api.get("/api/redefense/examSession", params);
    },

    add(params) {
        return Api.post("/api/redefense/examSession", params);
    },

    getDetail(id) {
        return Api.get(`/api/redefense/examSession/${id}`);
    },

    update(params) {
        return Api.put(`/api/redefense/examSession/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/redefense/examSession/${id}`);
    },

    assignTeacher(examSessionId, teacherIds) {
        return Api.post(`/api/redefense/examSession/assignTeacher/${examSessionId}`, {
            examSessionId,
            teacherIds,
        });
    },

    assignStudent(examSessionId, registerIds) {
        return Api.post(`/api/redefense/examSession/assignStudent/${examSessionId}`, {
            registerIds,
            examSessionId,
        });
    },

    changeExamSessionStatus(params) {
        return Api.put(`/api/redefense/examSession/changeExamSessionStatus/${params.id}`, params);
    },

    changeExamStatusPublic(params) {
        return Api.put(`/api/redefense/examSession/changeExamStatus/${params.id}`, params);
    },

    changeScoreStatus(id, data) {
        return Api.put(`/api/redefense/examSession/changeScoreStatus/${id}`, data);
    },

    sendMailScore(id) {
        return Api.put(`/api/redefense/examSession/mail/result/${id}`);
    },

    sendMailSchedule(id) {
        return Api.put(`/api/redefense/examSession/mail/schedule/${id}`);
    },

    getAll(params) {
        return Api.get("/api/redefense/examSession/list", params);
    },

    getExamTerms(examId) {
        return Api.get("/api/redefense/examSession/terms", examId);
    },

    getStudentByExamSession(params) {
        return Api.get("/api/redefense/register/studentByExamSession", params);
    },

    getStudentByExamSession2(params) {
        return Api.get("/api/redefense/register/studentByExamSession/detail", params);
    },

    export(id) {
        return Api.get("/api/redefense/examSession/exportExcel/" + id);
    },

    getTemplate() {
        return Api.get("/api/redefense/examSession/templateImport");
    },

    getTeachersInSession(examSessionId) {
        return Api.get(`/api/redefense/examSession/teachers/${examSessionId}`);
    },

    checkImport(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.postMultipart("/api/redefense/examSession/checkImport", file);
    },

    exportNoScore(param) {
        return Api.get("/api/redefense/examSession/exportAllNoScore", param);
    },

    confirmImport(data) {
        return Api.post(`/api/redefense/examSession/importExcel`, data);
    },

    listNotInPaymentExam(params) {
        return Api.get("/api/redefense/paymentTeacher/list-not-in-payment-exam", params);
    },
}

