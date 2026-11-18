import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/configMailReceiver", params);
    },

    getAllList(params) {
        return Api.get("/api/configMailReceiver/list", params);
    },

    getDetail(params) {
        return Api.get("/api/configMailReceiver/" + params.id, params);
    },

    add(data) {
        return Api.post("/api/configMailReceiver", data);
    },

    delete(data) {
        return Api.delete("/api/configMailReceiver/" + data.id);
    },

    update(data) {
        return Api.put("/api/configMailReceiver/" + data.id, data);
    },

    changeStatus(data) {
        return Api.put("/api/configMailReceiver/changeStatus/" + data.id, data);
    },
}

