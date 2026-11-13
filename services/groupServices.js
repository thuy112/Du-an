import Api from "~/api/Api.js"

export default {
    getList(params) {
        return Api.get("/api/auth/group", params)
    },

    getListUser(params) {
        return Api.get("/api/user/list", params)
    },

    addUserToGroup(data) {
        return Api.put("/api/auth/group/user/" + data.id, data)
    },

    getListPage(params) {
        return Api.get("/api/auth/page", params)
    },

    getDetail(params) {
        return Api.get("/api/auth/group/" + params.id, params)
    },

    add(data) {
        return Api.post("/api/auth/group", data)
    },

    update(data) {
        return Api.put("/api/auth/group/" + data.groupId, data)
    },

    delete(data) {
        return Api.delete("/api/auth/group/" + data.id)
    },
}


