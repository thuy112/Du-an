// services/userServices.js
import Api from '~/api/Api.js'

class UserServices {
  // Lấy danh sách người dùng
  getUsers(params) {
    return Api.get('/api/users', params)
  }

  // Chi tiết người dùng
  getUserById(id) {
    return Api.get(`/api/users/${id}`)
  }

  // Tạo mới người dùng
  createUser(data) {
    return Api.post('/api/users', data)
  }

  // Cập nhật người dùng
  updateUser(id, data) {
    return Api.put(`/api/users/${id}`, data)
  }

  // Xóa người dùng
  deleteUser(id) {
    return Api.delete(`/api/users/${id}`)
  }

  // Upload avatar
  uploadAvatar(formData) {
    return Api.postMultipart('/api/users/upload-avatar', formData)
  }
}

export default new UserServices()
