import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/course/list', params)
  },
  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  changeStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/course/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  add(data, channel = 'CMS') {
    return Api.post('/api/course/add', { ...data, channel })
  },
  // Lấy chi tiết khóa học theo ID khi bấm nút Sửa
  getDetail(id, channel = 'CMS') {
    return Api.get(`/api/course/${id}`, { channel })
  },
  // Cập nhật khóa học theo ID
  update(id, data, channel = 'CMS') {
    return Api.put(`/api/course/${id}`, { ...data, channel })
  },
  
}