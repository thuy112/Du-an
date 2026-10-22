import Api from "~/api/Api.js"

export default {
    login(data) {
        return Api.post("/api/auth/login", data)
    },

    logout(data) {
        return Api.post("/api/auth/logout", data)
    },

    getCode(data) {
        return Api.post("/api/auth/forgetPassword", data)
    },

    forgetPassword(data) {
        return Api.put("/api/auth/forgetPassword", data)
    },

    getRoleByUser(data) {
        return Api.get("/api/auth/getPageRole", data)
    },

    updateInfo(data) {
        return Api.put("/api/auth/info", data)
    }
}