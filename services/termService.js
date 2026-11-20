import Api from "~/api/Api.js";

export default{
    getList(params) {
        return Api.get("/api/term/", params);
    },

    getTermTypesByEducationProgram(params) {
        return Api.get("/api/term/termTypes", params);
    },

    getListForRegister(params) {
        return Api.get("/api/term/listForRegister", params);
    },

    getListForRegisterRetakeSession(params) {
        return Api.get("/api/term/listForRegisterRetakeSession", params);
    },

    addNew(params) {
        return Api.post("/api/term", params);
    },

    getDetail(id) {
        return Api.get(`/api/term/${id}`);
    },

    update(params) {
        return Api.put(`/api/term/${params.id}`, params);
    },

    changeStatus(params) {
        return Api.put(`/api/term/changeStatus/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/term/${id}`);
    },

    getAll(params) {
        return Api.get("/api/term/list", params);
    },

    getTemplate() {
        return Api.get("/api/term/templateImport");
    },

    checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart("/api/term/checkImport", form);
    },

    getListByRegisterRetakeSession(params) {
        return Api.get("/api/retakeCourseClient/listByRegister", params);
    },

    getListRegisterRetakeSession(params) {
        return Api.get("/api/retakeCourseClient/listForRegister", params);
    },

    confirmImport(terms) {
        return Api.post("/api/term/importExcel", terms);
    },
}

