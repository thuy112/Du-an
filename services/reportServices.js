import Api from "~/api/Api.js";

export default {
    synthetic(params) {
        return Api.get("/api/report/synthetic", params);
    },

    exportSynthetic(params) {
        return Api.get("/api/report/exportSynthetic", params);
    },

    result(params) {
        return Api.get("/api/report/result", params);
    },

    resultNotPaid(params) {
        return Api.get("/api/report/resultNotPaid", params);
    },

    resultTeacherPayment(params) {
        return Api.get("/api/report/resultTeacherPayment", params);
    },

    exportTeacherPayment(params) {
        return Api.get("/api/report/exportTeacherPayment", params);
    },

    exportTeacherPaymentLsit(params) {
        return Api.get("/api/report/exportTeacherPaymentList", params);
    },

    exportResult(params) {
        return Api.get("/api/report/exportResult", params);
    },

    exportResultNotPaid(params) {
        return Api.get("/api/report/exportResultNotPaid", params);
    },

    // @@@ báo cáo kết quả thu ( bảo vệ lại)
    revenueReport(params) {
        return Api.get("/api/redefense/report/result", params);
    },

    // @@@ export báo cáo kết quả thu ( bảo vệ lại)
    exportRevenueReport(params) {
        return Api.get("/api/redefense/report/exportResult", params);
    },

    // @@@ sinh viên đăng ký ( bảo vệ lại)
    registerReport(params) {
        return Api.get("/api/redefense/report/synthetic", params);
    },

    // @@@ export sinh viên đăng ký ( bảo vệ lại)
    exportRegisterReport(params) {
        return Api.get("/api/redefense/report/exportSynthetic", params);
    },

    exportConfirm(params) {
        return Api.put(`/api/redefense/register/${params.id}`, params);
    },

    // @@@ sinh viên chưa thanh toán( bảo vệ lại)
    reportResultNotPaid(params) {
        return Api.get("/api/redefense/report/resultNotPaid", params);
    },

    // @@@ b/c tổng hợp sinh viên( bảo vệ lại)
    reportSummary(params) {
        return Api.get("/api/redefense/report/summary", params);
    },

    // @@@ export tổng hợp sinh viên( bảo vệ lại)
    exportReportSummary(params) {
        return Api.get("/api/redefense/report/exportSummary", params);
    },

    // @@@ export sinh viên chưa thanh toán( bảo vệ lại)
    exportReportResultNotPaid(params) {
        return Api.get("/api/redefense/report/exportResultNotPaid", params);
    },

    // @@@ báo cáo thanh toán giảng viên( bảo vệ lại)
    reportTeacherPayment(params) {
        return Api.get("/api/redefense/report/paymentTeacher", params);
    },

    // @@@ export báo cáo thanh toán giảng viên( bảo vệ lại)
    exportReportTeacherPayment(params) {
        return Api.get("/api/redefense/report/exportPaymentTeacher", params);
    },

    // @@@ báo cáo sinh viên tổng hợp (New)
    reportStudentSummary(params) {
        return Api.get("/api/report/reportStudent", params);
    },
}


