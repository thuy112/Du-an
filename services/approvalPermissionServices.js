import Api from "~/api/Api.js";

export default {
    getPermissionByUser(id) {
        return Api.get(`/api/approvalPermission/${id}`);
    },

    update(params) {
        return Api.put(`/api/approvalPermission`, params);
    },
}

