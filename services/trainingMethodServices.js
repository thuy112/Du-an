import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/trainingMethod", params);
    },

    addNew(params) {
        return Api.post("/api/trainingMethod", params);
    },

    getDetail(id) {
        return Api.get(`/api/trainingMethod/${id}`);
    },

    update(params) {
        return Api.put(`/api/trainingMethod/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/trainingMethod/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/trainingMethod/changeStatus/" + data.id, data);
    },

    getAll(params) {
        return Api.get("/api/trainingMethod/list", params);
    },

    getTrainingTypes(trainingMethodId) {
        return Api.get(`/api/trainingMethod/${trainingMethodId}/training-types`);
    },
}


