import Api from "~/api/Api.js";

export default {
    async getByClassList(params) {
        return await Api.get("/decisionTeacherJobFee/byClass", params);
    },
    async getAllExam(params) {
        return await Api.get("/exam/allExam", params);
    },
    async getShortRetakeCourse(params) {
        return await Api.get("/retakeCourse/short");
    },
    async getTeacherList(params) {
        return await Api.get("/teacher/list", params);
    },
    async getTeachersByClass(ids) {
        return await Api.get(`/teacher/rc/listByClass?ids=${ids}`);
    },
    async changeStatus(id, data) {
        return await Api.put(`/decisionTeacherJobFee/byClass/${id}/status`, data);
    },
    async exportAllV1(param) {
        return await Api.get("/decisionTeacherJobFee/export-excel/TeacherByClass", param);
    },
    async exportPaymentList(param) {
        return await Api.get("/decisionTeacherJobFee/export-excel/TeacherByClass/list", param);
    },
    async export(teacherPaymentId) {
        return await Api.get("/redefense/paymentTeacher/export", { teacherPaymentId });
    }
};