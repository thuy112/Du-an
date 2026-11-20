import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/retakeSession", params);
    },

    getAll(params) {
        return Api.get("/api/retakeSession/list", params);
    },

    addNew(params) {
        return Api.post("/api/retakeSession", params);
    },

    getDetail(id) {
        return Api.get(`/api/retakeSession/${id}`);
    },

    update(params) {
        return Api.put(`/api/retakeSession/${params.id}`, params);
    },

    changeStatus(params) {
        return Api.put(`/api/retakeSession/changeStatus/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/retakeSession/${id}`);
    },

    export(params) {
        return Api.get(`/api/retakeSession/export`, params);
    },

    import(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.get(`/api/retakeSession/import`, file);
    },

    getListRegisterRetakeSession(params) {
        return Api.get("/api/retakeSession/exam-list", params);
    },

    setDeadline(params) {
        return Api.put(`/api/retakeSession/changePaymentToTime/${params.id}`, {
            date: params.date,
        });
    },
}

