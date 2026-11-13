import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/user/list", params);
    },

    add(data) {
        return Api.post("/api/user", data);
    },

    delete(data) {
        return Api.delete("/api/user/" + data.id);
    },

    update(data) {
        return Api.put("/api/user/" + data.id, data);
    },

    resetPassword(data) {
        return Api.put("/api/user/resetPassword/" + data.id);
    },

    getInfo(params) {
        return Api.get("/api/user/info", params);
    },

    getListClassByUser(id) {
        return Api.get(`/api/user/clazz/${id}`);
    },

    assignClass(data) {
        return Api.post(`/api/user/clazz`, data);
    },

    changePassword(data) {
        return Api.put("/api/user/changePass", data);
    },

    changeStatus(data) {
        return Api.put("/api/user/changeStatus/" + data.id, data);
    },

    UserOperations(data) {
        return Api.get("/api/user/logs", data);
    },
}

