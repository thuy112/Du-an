import Api from "~/api/Api.js";

class PaymentTeacherExamServices {
    async getList(params) {
        return await Api.get("/redefense/paymentTeacherExam", params);
    }

    async addNew(params) {
        return await Api.post("/redefense/paymentTeacherExam", params);
    }

    async sendMail(params) {
        return await Api.post("/redefense/paymentTeacherExam/sendMailPaymentTotalRetake", params);
    }

    async getDetail(id) {
        return await Api.get(`/redefense/paymentTeacherExam/detail/${id}`);
    }

    async update(params) {
        return await Api.put(`/redefense/paymentTeacherExam/${params.id}`, params);
    }

    async delete(id) {
        return await Api.delete(`/redefense/paymentTeacherExam/${id}`);
    }

    async changeStatus(data) {
        return await Api.put("/redefense/paymentTeacherExam/changeStatus/" + data.id, data);
    }

    async getAll(params) {
        return await Api.get("/redefense/paymentTeacherExam/list", params);
    }

    async exportTotal(params) {
        return await Api.get("/redefense/paymentTeacherExam/export-total", params);
    }

    // export file total
    async exportFileTotal(params) {
        return await Api.get(`/decisionTeacherJobFee/export-excel/summary`, params);
    }

    // @@ Export file detail
    async exportFileDetail(params) {
        return await Api.get(`/decisionTeacherJobFee/export-excel/detail`, params);
    }

    // @@ Export file shorten
    async exportFileDetailShorten(params) {
        return await Api.get(`/decisionTeacherJobFee/export-excel/shorten`, params);
    }

    async exportDetail(params) {
        return await Api.get("/redefense/paymentTeacherExam/export-detail", params);
    }
}

export default new PaymentTeacherExamServices();
