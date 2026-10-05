import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/students', { params })
  }
}
