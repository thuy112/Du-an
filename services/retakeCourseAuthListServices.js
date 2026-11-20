import Api from "~/api/Api.js";

export const ENUM_RESULT = {
    RETAKE_EXAM: "RETAKE_EXAM",
    RETAKE_COURSE: "RETAKE_COURSE",
};

export const RESULT_LIST = [
    { text: "Học lại", value: ENUM_RESULT.RETAKE_COURSE },
    { text: "Thi lại", value: ENUM_RESULT.RETAKE_EXAM },
];

export const ENUM_CLASS_TYPE = {
    OPEN_CLASS: "OPEN_CLASS",
    COMBINED_CLASS: "COMBINED_CLASS",
};

export const CLASS_TYPE_LIST = [
    { text: "Lớp mở", value: ENUM_CLASS_TYPE.OPEN_CLASS },
    { text: "Lớp ghép", value: ENUM_CLASS_TYPE.COMBINED_CLASS },
];

export default {
    getList(params) {
        return Api.get("/api/retakeCourseAuthList", params);
    },

    confirmImport(params) {
        return Api.post(`/api/retakeCourseAuthList/import`, params);
    },

    export(params) {
        return Api.get(`/api/retakeCourseAuthList/export`, params);
    },

    checkImport(data) {
        const file = new FormData();
        file.append("file", data);
        return Api.postMultipart(`/api/retakeCourseAuthList/import/check`, file);
    },

    getDetail(id) {
        return Api.get("/api/retakeCourseAuthList/detail/" + id);
    },

    update(params) {
        return Api.put(`/api/retakeCourseAuthList/${params.id}`, params);
    },

    delete(id) {
        return Api.delete(`/api/retakeCourseAuthList/${id}`);
    },

    changeStatus(data) {
        return Api.put("/api/retakeCourseAuthList/changeStatus/" + data.id, data);
    },

    getRegisterExam(code) {
        return Api.get("/api/retakeCourseAuthList/examSession", { code });
    },

    changeAllowRegisterStatus(data) {
        return Api.put("/api/retakeCourseAuthList/allowed/" + data.id, data);
    },

    getAll(status) {
        return Api.get("/api/retakeCourseAuthList/list", status);
    },

    getTemplate() {
        return Api.get(`/api/retakeCourseAuthList/template`);
    },

    add(data) {
        return Api.post(`/api/retakeCourseAuthList`, data);
    },

    getListStudent(params) {
        return Api.get(`/api/retakeCourseAuthList/authStudent`, params);
    },

    sendMail(ids) {
        return Api.post(`/api/retakeCourseAuthList/sendMail`, ids);
    },
}

