import Api from "~/api/Api.js";

export default {
    getListResult(params) {
        return Api.get("/api/RetakeCourseResult", params);
    },

    export(params) {
        return Api.get(`/api/RetakeCourseResult/export`, params);
    },

    import(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.get(`/api/RetakeCourseResult/import`, file);
    },

    addNew(params) {
        return Api.post("/api/RetakeCourseResult", params);
    },

    update(params) {
        return Api.put(`/api/RetakeCourseResult/${params.id}`, params);
    },

    getDetail(id) {
        return Api.get(`/api/RetakeCourseResult/${id}`);
    },

    checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart(`/api/RetakeCourseResult/import/check`, form);
    },

    closed(params) {
        return Api.post(`/api/RetakeCourseResult/closed`, params);
    },

    getTemplate() {
        return Api.get(`/api/RetakeCourseResult/template`);
    },
}

