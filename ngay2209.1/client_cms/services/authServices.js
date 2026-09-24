import Api from '~/api/Api.js' //

class AuthServices {
  // Gọi API đăng nhập[cite: 1]
  login(data) {
    return Api.post('/api/auth/login', data)
  }

  // Lấy thông tin tài khoản[cite: 1, 6]
  getUserInfo() {
    return Api.get('/api/auth/info')
  }

  // Lấy Sidebar Menu[cite: 1, 6]
  getPageRole() {
    return Api.get('/api/auth/getPageRole')
  }

  // Đăng xuất[cite: 1, 6]
  logout() {
    return Api.post('/api/auth/logout')
  }
}

export default new AuthServices()
