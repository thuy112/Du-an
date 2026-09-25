import Api from '~/api/Api.js'

class MailConfigService {
  getList(params) {
    return Api.get('/api/mail-config', { params })
  }

  delete(id) {
    return Api.delete(`/api/mail-config/${id}`)
  }

  updateStatus(id, status) {
    return Api.put(`/api/mail-config/${id}/status`, { status })
  }
}

export default new MailConfigService()