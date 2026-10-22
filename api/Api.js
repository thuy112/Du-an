/*
 * Wrapper Axios Methods Api
 */

class Api {
    constructor($axios) {
        this.$axios = $axios;
    }

    async get(url, params) {
        return await this.$axios
            .get(url, { params })
            .then((res) => res)
            .catch((err) => err);
    }

    async post(url, data) {
        return await this.$axios
            .post(url, data)
            .then((res) => res)
            .catch((error) => {
                throw error;
            });
    }

    async put(url, data) {
        return await this.$axios
            .put(url, data)
            .then((res) => res)
            .catch((error) => {
                throw error;
            });
    }

    async delete(url, data) {
        return await this.$axios
            .delete(url, { params: data })
            .then((res) => res)
            .catch((error) => {
                throw error;
            });
    }

    async getBlob(url, data) {
        return await this.$axios
            .post(url, data, { responseType: "blob" })
            .then((res) => res)
            .catch((error) => {
                throw error;
            });
    }

    async postMultipart(url, data) {
        return await this.$axios
            .post(url, data, {
                headers: {
                    "Content-Type": "Multipart/form-data",
                },
            })
            .then((res) => res)
            .catch((error) => {
                throw error;
            });
    }
}

export default new Api();
