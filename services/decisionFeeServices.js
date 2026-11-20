import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/decisionFee", params);
    },

    addNew(params) {
        return Api.post("/api/decisionFee", params);
    },

    getDetail(id) {
        return Api.get(`/api/decisionFee/${id}`);
    },

    getFee(params) {
        return Api.get(`/api/decisionFee/estimation`, params);
    },

    update(params) {
        return Api.put(`/api/decisionFee/${params.id}`, params);
    },

    changeStatus(params) {
        return Api.put(`/api/decisionFee/changeStatus/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/decisionFee/${id}`);
    },

    getTemplate() {
        return Api.get("/api/decisionFee/template");
    },

    import(data) {
        return Api.post("/api/decisionFee/import", data);
    },

    checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart("/api/decisionFee/import/check", form);
    },

    export(decisionFeeId) {
        return Api.get("/api/decisionFee/export", { decisionFeeId });
    },
}

