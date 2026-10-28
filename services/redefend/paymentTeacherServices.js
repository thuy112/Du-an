import Api from "~/api/Api.js";

class PaymentTeacherServices {
    async getList(params) {
        return await Api.get("/redefense/paymentTeacher", params);
    }

    async add(params) {
        return await Api.post("/redefense/paymentTeacher", params);
    }

    async getDetail(id) {
        return await Api.get(`/redefense/paymentTeacher/${id}`);
    }

    async update(params) {
        return await Api.put(`/redefense/paymentTeacher`, params);
    }

    async delete(id) {
        return await Api.delete(`/redefense/paymentTeacher/${id}`);
    }

    async changeStatus(data) {
        return await Api.put("/redefense/paymentTeacher/status/" + data.id, data);
    }

    async getTeachers(data) {
        return await Api.get(`/redefense/paymentTeacher/teachers/${data.examSessionId}`);
    }

    async getTemplate() {
        return await Api.get("/redefense/paymentTeacher/templateImport");
    }

    async import(data) {
        return await Api.post("/redefense/paymentTeacher/import", data);
    }

    async checkImport(file) {
        const form = new FormData();
        form.append("file", file);
        return await Api.postMultipart("/redefense/paymentTeacher/import/check", form);
    }

    async export(teacherPaymentId) {
        return await Api.get("/redefense/paymentTeacher/export", {
            teacherPaymentId,
        });
    }

    async exportStudentPaid(id) {
        return await Api.get(`/redefense/paymentTeacher/export-student-paid/${id}`);
    }

    async exportAll(param) {
        return await Api.get("/redefense/paymentTeacher/exportv1", param);
    }

    async exportAllV1(param) {
        return await Api.get("/decisionTeacherJobFee/export-excel/TeacherByClass", param);
    }

    async exportPaymentList(param) {
        return await Api.get("/decisionTeacherJobFee/export-excel/TeacherByClass/list", param);
    }
}

export default new PaymentTeacherServices();
