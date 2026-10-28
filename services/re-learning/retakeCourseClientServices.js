import Api from '~/api/Api.js'

class RetakeCourseClientsServices {
    // Lấy danh sách học phần / học lại theo phân trang hoặc bộ lọc
    async getList(params) {
        return await Api.get('/retakeCourse', params);
    }

    // Lấy chi tiết thông tin học lại theo id
    async getDetail(id) {
        return await Api.get(`/retakeCourse/${id}`);
    }

    // Lấy danh sách học phần nợ của sinh viên cần đăng ký học lại
    async getListForRegister(params) {
        return await Api.get('/registerRetakeCourse/listForRegister', params);
    }
}

export default new RetakeCourseClientsServices();