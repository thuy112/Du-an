import Api from "~/api/Api.js";

export default{
    getList(params) {
        return Api.get("/api/configMail", params);
    },

    getAllList(params) {
        return Api.get("/api/configMail/list", params);
    },

    getDetail(params) {
        return Api.get("/api/configMail/" + params.id, params);
    },

    add(data) {
        return Api.post("/api/configMail", data);
    },

    delete(data) {
        return Api.delete("/api/configMail/" + data.id);
    },

    update(data) {
        return Api.put("/api/configMail/" + data.id, data);
    },

    changeStatus(data) {
        return Api.put("/api/configMail/changeStatus/" + data.id, data);
    },
}

