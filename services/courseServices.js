import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/course/list", params);
    },

    addNew(params) {
        return Api.post("/api/course/add", params);
    },

    getDetail(id) {
        return Api.get(`/api/course/${id}`);
    },

    changeStatus(id, status) {
        return Api.put(`/api/course/changeStatus/${id}`, status);
    },

    update(id, params) {
        return Api.put(`/api/course/${id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/course/${id}`);
    },

    getAll(params) {
        return Api.get("/api/course/all", params);
    },

    getTemplate() {
        return Api.get("/api/course/template");
    },

    import(data) {
        return Api.post("/api/course/import", { courseImports: [...data] });
    },

    checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart("/api/course/import/check", form);
    },
}

