import Api from '~/api/Api'

export default {
  // 1. API chính: Lấy danh sách lớp sinh viên (phân trang, tìm kiếm, lọc)
  getClassList(params) {
    return Api.get('/api/classes/list',params)
  },

  // 2. Các API phụ: Lấy danh sách option đổ vào các ô lọc Dropdown
  getTrainingUnitList(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return Api.get('/api/trainingUnit/list',params)
  },

  getMajorList(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return Api.get('/api/major/list',params)
  },

  getCourseAllList(params = { channel: 'CMS' }) {
    return Api.get('/api/course/all',params)
  },

  getTrainingMethodList(params = { status: 'ACTIVE', channel: 'CMS' }) {
    return Api.get('/api/trainingMethod/list',params)
  },

  // 3. API Đổi trạng thái lớp sinh viên
  changeClassStatus(id, data, channel = 'CMS') {
    return Api.put(`/api/classes/changeStatus/${id}`, data, { params: { channel } })
  },

  // 4. Các API phụ khác (User info & Role)
  getUserInfo(params = { channel: 'CMS' }) {
    return Api.get('/api/user/info',params)
  },

  getPageRole(params = { channel: 'CMS' }) {
    return Api.get('/api/auth/getPageRole',params)
  }
}