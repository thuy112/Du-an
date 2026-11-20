import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/exam", params);
    },
    addNew(params) {
        return Api.post("/api/exam", params);
    },

    getDetail(id) {
        return Api.get(`/api/exam/detail/${id}`);
    },

    update(params) {
        return Api.put(`/api/exam/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/exam/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/exam/changeStatus/" + data.id, data);
    },

    getAll(params) {
        return Api.get("/api/exam/list1", params);
    },
}

