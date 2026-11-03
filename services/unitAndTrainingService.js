import Api from '~/api/Api'

export default {
  // Tab 1: Đơn vị công tác
  getWorkUnitList(params) {
    return Api.get('/api/workUnit', params)
  },
  changeWorkUnitStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/workUnit/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  createWorkUnit(data, channel = 'CMS') {
    return Api.post('/api/workUnit', data, {
      params: { channel }
    })
  },
  // Cập nhật đơn vị công tác (Sửa)
  updateWorkUnit(id, data, channel = 'CMS') {
    return Api.put(`/api/workUnit/${id}`, data, {
      params: { channel }
    })
  },

  // Xóa đơn vị công tác
  deleteWorkUnit(id, channel = 'CMS') {
    return Api.delete(`/api/workUnit/${id}`, {
      params: { channel }
    })
  },

  // Tab 2: Địa điểm đào tạo
  getTrainingUnitList(params) {
    return Api.get('/api/trainingUnit', params)
  },
  changeTrainingUnitStatus(id, status, channel = 'CMS') {
    return Api.put(`/api/trainingUnit/changeStatus/${id}`, { status, channel }, {
      params: { status, channel }
    })
  },
  // API phụ lấy danh sách hình thức đào tạo cho bộ lọc ở Tab 2
  getTrainingMethodList(params) {
    return Api.get('/api/trainingMethod/list', params)
  },

  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },
  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },
  createTrainingUnit(data, channel = 'CMS') {
    return Api.post('/api/trainingUnit', data, {
      params: { channel }
    })
  },
  // Cập nhật địa điểm đào tạo (Sửa)
  updateTrainingUnit(id, data, channel = 'CMS') {
    return Api.put(`/api/trainingUnit/${id}`, data, {
      params: { channel }
    })
  },

  // Xóa địa điểm đào tạo
  deleteTrainingUnit(id, channel = 'CMS') {
    return Api.delete(`/api/trainingUnit/${id}`, {
      params: { channel }
    })
  },

  // --- QUẢN LÝ NGÀNH (MAJOR) ---
  getMajorList(params) {
    return Api.get('/api/major',params)
  },
  createMajor(data, channel = 'CMS') {
    return Api.post('/api/major', data, { params: { channel } })
  },
  updateMajor(id, data, channel = 'CMS') {
    return Api.put(`/api/major/${id}`, data, { params: { channel } })
  },
  deleteMajor(id, channel = 'CMS') {
    return Api.delete(`/api/major/${id}`, { params: { channel } })
  },

  // --- CHƯƠNG TRÌNH ĐÀO TẠO (CHO BỘ LỌC) ---
  getEducationProgramList(params) {
    return Api.get('/api/educationProgram/list',params)
  },
  // Thay đổi trạng thái ngành
  changeMajorStatus(id, data, channel = 'CMS') {
    return Api.put(`/api/major/changeStatus/${id}`, data, { params: { channel } })
  },
  // Lấy danh sách học phần theo ngành (dùng khi bấm icon cấu hình)
  getMajorTermList(params) {
    return Api.get('/api/majorTerm',params )
  },

  // Cập nhật tín chỉ học phần theo ID ngành/học phần
  updateMajorTerm(id, data, channel = 'CMS') {
    return Api.put(`/api/majorTerm/${id}`, data, { params: { channel } })
  },
  exportMajorExcel(params) {
    return Api.get('/api/major/export', {
      params,
      responseType: 'blob'
    })
  },
}