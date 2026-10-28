import Api from "~/api/Api.js";

class DecisionTeacherJobFeeServices {
    async getListExam(params) {
        return await Api.get("/decisionTeacherJobFee/byExam", params);
    }

    async getDetailExam(id) {
        return await Api.get(`/decisionTeacherJobFee/byExam/${id}`);
    }

    async addExam(params) {
        return await Api.post("/decisionTeacherJobFee/byExam", params);
    }

    async updateExam(params) {
        return await Api.put(`/decisionTeacherJobFee/byExam/${params.id}`, params);
    }

    async changeStatusExam(id, paymentFeeStatus) {
        return await Api.put(`/decisionTeacherJobFee/byExam/${id}/status`, {
            paymentFeeStatus,
        });
    }

    async deleteExam(id) {
        return await Api.delete(`/decisionTeacherJobFee/byExam/${id}`);
    }

    async getListTeacherClass(params) {
        return await Api.get("/decisionTeacherJobFee/teacher-class", params);
    }

    async getListClassByTeacher() {
        return await Api.get("/decisionTeacherJobFee/rc/teacher-class");
    }
}

export default new DecisionTeacherJobFeeServices();