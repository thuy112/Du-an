import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/classes/list", params);
    },

    getListAll(params) {
        return Api.get("/api/classes/all", params);
    },

    addNew(params) {
        return Api.post("/api/classes/add", params);
    },

    getDetail(id) {
        return Api.get(`/api/classes/${id}`);
    },

    update(params) {
        return Api.put(`/api/classes/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/classes/${id}`);
    },

    getTemplate() {
        return Api.get(`/api/classes/template`);
    },

    getTeacherInClass(id) {
        return Api.get(`/api/classes/teacher/${id}`);
    },

    assignTeacherInClass(params) {
        return Api.post(`/api/classes/teacher`, params);
    },

    import(params, courseCode) {
        return Api.post(`/api/classes/import`, { classesImports: [...params], courseCode });
    },

    checkImport(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.postMultipart(`/api/classes/import/check`, file);
    },
}

