import Api from '~/api/Api'

export default {
    getList(params) {
        return Api.get('/api/redefense/exam', params)
    },
    getPageRole(params) {
        return Api.get('/api/auth/getPageRole', params)
    },
    getUserInfo(params) {
        return Api.get('/api/user/info', params)
    },
    changeStatus(id, status, channel = 'CMS') {
        return Api.put(`/api/redefense/exam/changeStatus/${id}`, { status, channel }, {
            params: { status, channel }
        })
    },
    // Sửa lại đường dẫn POST thêm mới thành /api/redefense/exam đúng với API thực tế
    add(data, channel = 'CMS') {
        return Api.post('/api/redefense/exam', { ...data, channel })
    },
    getDetail(id, channel = 'CMS') {
        // Dùng Api.get thay vì Api.post
        return Api.get(`/api/redefense/exam/detail/${id}`, { params: { channel } })
        // Hoặc tuỳ theo route backend của bạn:
        // return Api.get(`/api/redefense/exam/${id}`, { params: { channel } })
    },
    update(id, data, channel = 'CMS') {
        return Api.put(`/api/redefense/exam/${id}`, { ...data, channel })
    },
    delete(id, channel = 'CMS') {
        return Api.delete(`/api/redefense/exam/${id}`, { params: { channel } })
    },
    getSemesters(params) {
        return Api.get('/api/semester/list', { status: 'ACTIVE', channel: 'CMS', ...params })
    },
}