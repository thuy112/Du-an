import Api from "~/api/Api.js";

/// @@@quản lý đợt bảo vệ lại
export default {
    getList(params) {
        return Api.get("/api/redefense/exam", params);
    },

    add(params) {
        return Api.post("/api/redefense/exam", params);
    },

    getDetail(id) {
        return Api.get(`/api/redefense/exam/detail/${id}`);
    },

    update(params) {
        return Api.put(`/api/redefense/exam/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/redefense/exam/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/redefense/exam/changeStatus/" + data.id, data);
    },

    getAll(params) {
        return Api.get("/api/redefense/exam/list", params);
    },

    getByStudent(params) {
        return Api.get("/api/redefense/exam/get-by-student", params);
    },
}


