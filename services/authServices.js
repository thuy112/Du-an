import Api from "~/api/Api.js"

class AuthServices {
    async login(data) {
        return await Api.post("api/auth/login", data)
    }

    async logout(data) {
        return await Api.post("api/auth/logout", data)
    }

    async getCode(data) {
        return await Api.post("api/auth/forgetPassword", data)
    }

    async forgetPassword(data) {
        return await Api.put("/api/auth/forgetPassword", data)
    }

    async getRoleByUser(data) {
        return await Api.get("api/auth/getPageRole", data)
    }

    async updateInfo(data) {
        return await Api.put("/api/auth/info", data)
    }
}

export default new AuthServices()