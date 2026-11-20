import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/schedule", params);
    },

    addNew(params) {
        return Api.post("/api/schedule", params);
    },

    getDetail(id) {
        return Api.get(`/api/schedule/${id}`);
    },

    update(params) {
        return Api.put(`/api/schedule/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/schedule/${id}`);
    },

    changeStatus(params) {
        return Api.put(`/api/schedule/changeStatus/${params.id}`, params);
    },

    getAll(status) {
        return Api.get("/api/schedule/list", status);
    },
}

