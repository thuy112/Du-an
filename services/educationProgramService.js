import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/educationProgram', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/educationProgram/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  exportTerm(id, channel = 'CMS') {
    return Api.get(`/api/educationProgram/exportTerm/${id}`, {
      params: { educationProgramId: id, channel },
      responseType: 'blob' // Xử lý nhận file tải về nếu cần
    })
  },

    getAll(status) {
        return Api.get("/api/educationProgram/list", status);
    },

    add(data) {
        return Api.post("/api/educationProgram", data);
    },

    getDetail(id) {
        return Api.get(`/api/educationProgram/${id}`);
    },

    confirmImport(data) {
        return Api.post("/api/educationProgram/import", data);
    },

    checkImport(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.post("/api/educationProgram/import/check", file);
    },

    delete(data) {
        return Api.delete("/api/educationProgram/" + data.id);
    },

    getTermTypeEducation(educationProgramId) {
        return Api.get(`/api/educationProgram/termTypes/${educationProgramId}`);
    },

    exportEducationProgram(educationProgramId) {
        return Api.get(`/api/educationProgram/exportTerm/${educationProgramId}`, {
            educationProgramId,
        });
    },

    getTemplate() {
        return Api.get(`/api/educationProgram/template`);
    },

    update(data) {
        return Api.put("/api/educationProgram/" + data.id, data);
    },
}