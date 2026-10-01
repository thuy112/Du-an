// Danh sách phân quyền / ủy quyền học lại.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/retake-course-auth-list', { params })
  },

  assignAuth(data) {//Phân quyền / ủy quyền học lại
    return Api.post('/api/v1/retake-course-auth-list', data)
  },

  revokeAuth(id) {//Thu hồi phân quyền / ủy quyền học lại
    return Api.delete(`/api/v1/retake-course-auth-list/${id}`)
  },
}