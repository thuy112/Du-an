import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/major", params);
    },

    addNew(params) {
        return Api.post("/api/major", params);
    },

    getDetail(id) {
        return Api.get(`/api/major/${id}`);
    },

    update(params) {
        return Api.put(`/api/major/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/major/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/major/changeStatus/" + data.id, data);
    },

    getAll(status) {
        return Api.get("/api/major/list", status);
    },

    getTemplate() {
        return Api.get("/api/major/template");
    },

    import(data) {
        return Api.post("/api/major/import", { majorImports: [data] });
    },

    checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart("/api/major/import/check", form);
    },

    export(params) {
        return Api.get("/api/major/export", params);
    },
}

