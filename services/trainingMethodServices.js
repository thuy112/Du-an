import Api from "~/api/Api.js";

class TrainingMethodServices {
    async getList(params) {
        return await Api.get("/trainingMethod", params);
    }

    async addNew(params) {
        return await Api.post("/trainingMethod", params);
    }

    async getDetail(id) {
        return await Api.get(`/trainingMethod/${id}`);
    }

    async update(params) {
        return await Api.put(`/trainingMethod/${params.id}`, params);
    }

    async delete(id) {
        return await Api.delete(`/trainingMethod/${id}`);
    }

    async changeStatus(data) {
        return await Api.put("/trainingMethod/changeStatus/" + data.id, data);
    }

    async getAll(params) {
        return await Api.get("/trainingMethod/list", params);
    }

    async getTrainingTypes(trainingMethodId) {
        return await Api.get(`/trainingMethod/${trainingMethodId}/training-types`);
    }
}

export default new TrainingMethodServices();
