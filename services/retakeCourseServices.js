import Api from '~/api/Api.js'

export default {
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },

  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },

  getSemesters(params) {
    return Api.get('/api/semester/list', params)
  },

  getRetakeSessions(params) {
    return Api.get('/api/retakeSession', params)
  },
  changeStatusCourse(id, data) {
    return Api.put(`/api/retakeCourse/changeRetakeCourseStatus/${id}`, data)
  },
  // Cập nhật trạng thái duyệt lớp học lại
  updateCourseStatus(id, data) {
    return Api.put(`/api/retakeCourse/${id}/status`, data)
  },

  // Thêm mới đợt đăng ký học lại
  createRetakeSession(data) {
    return Api.post('/api/retakeSession', data)
  },

  // Cập nhật đợt đăng ký học lại
  updateRetakeSession(id, data) {
    return Api.put(`/api/retakeSession/${id}`, data)
  },

  // Xóa đợt đăng ký học lại
  deleteRetakeSession(id, params) {
    return Api.delete(`/api/retakeSession/${id}`, { params })
  },

  changeStatusSession(id, data) {
    return Api.put(`/api/retakeSession/${id}`, data)
  },
    async getList(params) {
        return await Api.get("/retakeCourse", params);
    },

    async getListShort() {
        return await Api.get("/retakeCourse/short");
    },

    async addNew(params) {
        return await Api.post("/retakeCourse", params);
    },

    async getDetail(id) {
        return await Api.get(`/retakeCourse/${id}`);
    },

    async update(params) {
        return await Api.put(`/retakeCourse/${params.id}`, params);
    },

    async changeStatus(params) {
        return await Api.put(`/retakeCourse/changeRetakeCourseStatus/${params.id}`, params);
    },

    async changeScoreStatus(id, data) {
        return await Api.put(`/retakeCourse/changeStatusResult/${id}`, data);
    },

    async delete(id) {
        return await Api.delete(`/retakeCourse/${id}`);
    },

    async export(id) {
        return await Api.get(`/retakeCourse/export/${id}`);
    },

    async import(data) {
        const file = new FormData();
        file.append("file", data);
        return await Api.get(`/retakeCourse/import`, file);
    },

    async sendMailScore(id) {
        return await Api.post(`/retakeCourse/sendMailScore/${id}`);
    },

    // Gán giảng viên:
    async assignTeacher(params) {
        return await Api.post(`/retakeCourse/teacher`, params);
    },

    // API Bảng điểm
    async addResults(data) {
        return await Api.post("/RetakeCourseResult", data);
    },

    async getDetailResult(id) {
        return await Api.get(`/RetakeCourseResult/${id}`);
    },

    async updateResult(data) {
        return await Api.put(`/RetakeCourseResult/${data.id}`, data);
    },

    async comfirmResult(id) {
        return await Api.get(`/RetakeCourseResult/closed/${id}`);
    },

    // API Export no score:
    async exportScore(params) {
        return await Api.get(`/retakeCourse/exportScore`, params);
    },

    // API Get Template ScoreBoard:
    async getTemplateScoreBoard() {
        return await Api.get(`/retakeCourse/template`);
    },

    // API Send mail:
    async sendMail(id) {
        return await Api.put(`/retakeCourse/mail/result/${id}`);
    },

    // Inport ScoreBoard:
    async checkImportScoreBoard(file) {
        const form = new FormData();
        form.append("file", file);
        return await Api.postMultipart(`/retakeCourse/import/check`, form);
    },

    async importScoreBoard(examSessionId, data) {
        return await Api.post(`/retakeCourse/import`, {
            retakeCourseSession: examSessionId,
            retakeResultImports: [...data],
        });
    }
}
