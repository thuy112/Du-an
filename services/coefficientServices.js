import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/coefficient", params);
    },

    addNew(params) {
        return Api.post("/api/coefficient", params);
    },

    update(params) {
        return Api.put(`/api/coefficient/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/coefficient/${id}`);
    },

    getRange(params) {
        return Api.get("/api/coefficient/range", params);
    },
}

