import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/workUnit", params);
    },

    addNew(params) {
        return Api.post("/api/workUnit", params);
    },

    getDetail(id) {
        return Api.get(`/api/workUnit/${id}`);
    },

    update(id, params) {
        return Api.put(`/api/workUnit/${id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/workUnit/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/workUnit/changeStatus/" + data.id, data);
    },

    getAll(status) {
        return Api.get("/api/workUnit/list", status);
    },
}

