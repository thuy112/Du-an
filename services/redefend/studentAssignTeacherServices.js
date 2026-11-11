import Api from "~/api/Api.js";

export default {
    getList(params) {
        return Api.get("/api/redefense/studentAssignTeacher", params);
    },

    getDetail(id) {
        return Api.get("/api/redefense/studentAssignTeacher/" + id);
    },

    addNews(data) {
        return Api.post("/api/redefense/studentAssignTeacher", data);
    },

    delete(id) {
        return Api.delete("/api/redefense/studentAssignTeacher/" + id);
    },

    update(data) {
        return Api.put("/api/redefense/studentAssignTeacher", data);
    },

    // Import giảng viên hướng dẫn
    getTemplateTeacherManual() {
        return Api.get("/api/redefense/studentAssignTeacher/templateImport-guide-teacher");
    },

    checkImportTeacherManual(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.postMultipart(
            "/api/redefense/studentAssignTeacher/checkImport-guide-teacher",
            file
        );
    },

    // giảng viên hội đồng
    confirmImportTeacherManual(data) {
        return Api.post("/api/redefense/studentAssignTeacher/importExcel-guide-teacher", data);
    },

    getTemplateSessionTeacher() {
        return Api.get("/api/redefense/studentAssignTeacher/templateImport-session-teacher");
    },

    checkImportSessionTeacher(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.postMultipart(
            "/api/redefense/studentAssignTeacher/checkImport-session-teacher",
            file
        );
    },

    confirmImportSessionTeacher(data) {
        return Api.post("/api/redefense/studentAssignTeacher/importExcel-session-teacher", data);
    },
}

