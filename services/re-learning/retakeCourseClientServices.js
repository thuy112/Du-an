import Api from '~/api/Api.js'

export default {
    // Lấy danh sách học phần / học lại theo phân trang hoặc bộ lọc
    getList(params) {
        return Api.get('/api/retakeCourse', params);
    },

    // Lấy chi tiết thông tin học lại theo id
    getDetail(id) {
        return Api.get(`/api/retakeCourse/${id}`);
    },

    // Lấy danh sách học phần nợ của sinh viên cần đăng ký học lại
    getListForRegister(params) {
        return Api.get('/api/registerRetakeCourse/listForRegister', params);
    },
    getListAllForRegister(params) {
        return Api.get("/api/retakeCourseClient/listAllForRegister", params);
    }
}
