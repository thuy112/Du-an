import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/trainingType", params);
    },

    addNew(params) {
        return Api.post("/api/trainingType", params);
    },

    getDetail(id) {
        return Api.get(`/api/trainingType/${id}`);
    },

    update(params) {
        return Api.put(`/api/trainingType/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/trainingType/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/trainingType/changeStatus/" + data.id, data);
    },

    getAll(params) {
        return Api.get("/api/trainingType/list", params);
    },
}

