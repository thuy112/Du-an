/*Quản lý hệ số lớp, hệ số quy đổi*/
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/coefficients', { params })
  },

  create(data) {
    return Api.post('/api/v1/coefficients', data)
  },

  update(id, data) {
    return Api.put(`/api/v1/coefficients/${id}`, data)
  },

  delete(id) {
    return Api.delete(`/api/v1/coefficients/${id}`)
  },
}