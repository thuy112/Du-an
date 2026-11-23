import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/redefense/decisionFee", params);
    },

    add(params) {
        return Api.post("/api/redefense/decisionFee", params);
    },

    getDetail(id) {
        return Api.get(`/api/redefense/decisionFee/${id}`);
    },

    update(params) {
        return Api.put(`/api/redefense/decisionFee/${params.id}`, params);
    },

    changeStatus(params) {
        return Api.put(`/api/redefense/decisionFee/changeStatus/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/redefense/decisionFee/${id}`);
    },

    getFee(params) {
        return Api.get(`/api/redefense/decisionFee/estimation`, params);
    },

    getTemplate() {
        return Api.get("/api/redefense/decisionFee/template");
    },

    import(data) {
        return Api.post("/api/redefense/decisionFee/import", data);
    },

    checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return Api.postMultipart("/api/redefense/decisionFee/import/check", form);
    },

    export(decisionFeeId) {
        return Api.get("/api/redefense/decisionFee/export", { decisionFeeId });
    },
}

