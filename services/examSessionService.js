import Api from "~/api/Api.js"

export default {
    getList(params) {
        return Api.get("/api/examSession", { channel: 'CMS', ...params })
    },

    getClasses() {
        return Api.get("/api/classes/all", { channel: 'CMS' })
    },

    getExams(params) {
        return Api.get("/api/exam/list1", { status: 'ACTIVE', channel: 'CMS', ...params })
    },

    getTerms(params) {
        return Api.get("/api/term/list", { status: 'ACTIVE', channel: 'CMS', ...params })
    },

    createExamSession(data) {
        return Api.post("/api/examSession", data, { params: { channel: 'CMS' } })
    },

    updateExamSession(id, data) {
        return Api.put(`/api/examSession/${id}`, data, { params: { channel: 'CMS' } })
    },

    deleteExamSession(id) {
        return Api.delete(`/api/examSession/${id}`, { params: { channel: 'CMS' } })
    }
}