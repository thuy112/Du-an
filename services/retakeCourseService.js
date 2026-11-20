import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/retakeCourse", params);
    },

    getListShort() {
        return Api.get("/api/retakeCourse/short");
    },

    addNew(params) {
        return Api.post("/api/retakeCourse", params);
    },

    getDetail(id) {
        return Api.get(`/api/retakeCourse/${id}`);
    },

    update(params) {
        return Api.put(`/api/retakeCourse/${params.id}`, params);
    },

    changeStatus(params) {
        return Api.put(`/api/retakeCourse/changeRetakeCourseStatus/${params.id}`, params);
    },

    changeScoreStatus(id, data) {
        return Api.put(`/api/retakeCourse/changeStatusResult/${id}`, data);
    },

    delete(id) {
        return Api.delete(`/api/retakeCourse/${id}`);
    },

    export(id) {
        return Api.get(`/api/retakeCourse/export/${id}`);
    },

    import(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.get(`/api/retakeCourse/import`, file);
    },

    sendMailScore(id) {
        return Api.post(`/api/retakeCourse/sendMailScore/${id}`);
    },

    // Gán giảng viên:
    assignTeacher(params) {
        return Api.post(`/api/retakeCourse/teacher`, params);
    },

    // API Bảng điểm
    addResults(data) {
        return Api.post("/api/RetakeCourseResult", data);
    },

    getDetailResult(id) {
        return Api.get(`/api/RetakeCourseResult/${id}`);
    },

    updateResult(data) {
        return Api.put(`/api/RetakeCourseResult/${data.id}`, data);
    },

    comfirmResult(id) {
        return Api.get(`/api/RetakeCourseResult/closed/${id}`);
    },

    // API Export no score:
    exportScore(params) {
        return Api.get(`/api/retakeCourse/exportScore`, params);
    },

    // API Get Template ScoreBoard:
    getTemplateScoreBoard() {
        return Api.get(`/api/retakeCourse/template`);
    },

    // API Send mail:
    sendMail(id) {
        return Api.put(`/api/retakeCourse/mail/result/${id}`);
    },

    // Inport ScoreBoard:
    checkImportScoreBoard(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart(`/api/retakeCourse/import/check`, form);
    },

    importScoreBoard(examSessionId, data) {
        return Api.post(`/api/retakeCourse/import`, {
            retakeCourseSession: examSessionId,
            retakeResultImports: [...data],
        });
    },
}

