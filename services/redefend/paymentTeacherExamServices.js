import Api from "~/api/Api.js";

export default {
     getList(params) {
        return Api.get("/api/redefense/paymentTeacherExam", params);
    },

     addNew(params) {
        return Api.post("/api/redefense/paymentTeacherExam", params);
    },

     getDetail(id) {
        return Api.get(`/api/redefense/paymentTeacherExam/detail/${id}`);
    },

     sendMail(params) {
        return Api.post("/api/redefense/paymentTeacherExam/sendMailPaymentTotalRetake", params);
    },

     update(params) {
        return Api.put(`/api/redefense/paymentTeacherExam/${params.id}`, params);
    },

     delete(id) {
        return Api.delete(`/api/redefense/paymentTeacherExam/${id}`);
    },

     changeStatus(data) {
        return Api.put("/api/redefense/paymentTeacherExam/changeStatus/" + data.id, data);
    },

     getAll(params) {
        return Api.get("/api/redefense/paymentTeacherExam/list", params);
    },

     exportTotal(params) {
        return Api.get("/api/redefense/paymentTeacherExam/export-total", params);
    },

     exportDetail(params) {
        return Api.get("/api/redefense/paymentTeacherExam/export-detail", params);
    },
     getListNotInPaymentExam(params) {
        return Api.get("/api/redefense/paymentTeacher/list-not-in-payment-exam", params);
    },

}
