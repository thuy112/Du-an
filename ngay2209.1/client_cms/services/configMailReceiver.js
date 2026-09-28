import Api from '~/api/Api.js'

export default {
  getList(params) {
    return Api.get('/api/mail-receiver-config', { params })
  },

  delete(id) {
    return Api.delete(`/api/mail-receiver-config/${id}`)
  }
}

