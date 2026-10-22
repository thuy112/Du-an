import Api from '~/api/Api.js'

export default {
  getList(params) {
    // Dùng cú pháp truyền params trực tiếp tương thích y hệt $axios gốc
    return Api.get('/api/coefficient', { params })
  },
  create(data) {
    return Api.post('/api/coefficient', data)
  },
  update(id, data) {
    return Api.put(`/api/coefficient/${id}`, data)
  },
  delete(id, params) {
    return Api.delete(`/api/coefficient/${id}`, { params })
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', { params })
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', { params })
  }
}