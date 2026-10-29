import Api from "~/api/Api.js";

const reportSyntheticService = {
    // API chính: Lấy danh sách báo cáo tổng hợp
    async getSyntheticReport(params) {
        return await Api.get("/report/synthetic", params);
    },
    // API phụ: Lấy danh sách đợt học lại
    async getExamList(params) {
        return await Api.get("/retakeSession/exam-list", params);
    },
    // API phụ: Lấy thông tin user
    async getUserInfo(params) {
        return await Api.get("/user/info", params);
    },
    // API phụ: Phân quyền trang
    async getPageRole(params) {
        return await Api.get("/auth/getPageRole", params);
    }
};

export default reportSyntheticService;