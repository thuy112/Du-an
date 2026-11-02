import Api from '~/api/Api.js'

async function getApiData(url, params) {
  const response = await Api.get(url, params)
  if (
    response instanceof Error ||
    response?.isAxiosError ||
    response?.success === false
  ) {
    throw response instanceof Error || response?.isAxiosError
      ? response
      : new Error(`API ${url} trả về lỗi.`)
  }
  return response
}

export default {
  // Lấy danh sách kỳ thi lại kèm bộ lọc
  getExamList(params) {
    return getApiData('/exam', params)
  },

  // Tạo mới kỳ thi lại
  createExam(data) {
    return Api.post('/exam', data)
  },

  // Cập nhật kỳ thi lại
  updateExam(id, data) {
    return Api.put(`/exam/${id}`, data)
  },

  // Cập nhật trạng thái kỳ thi lại
  updateExamStatus(id, status) {
    return Api.patch(`/exam/${id}/status`, { status })
  },

  // Xóa kỳ thi lại
  deleteExam(id) {
    return Api.delete(`/exam/${id}`)
  },

  // Lấy quyền của trang (Service phụ trợ)
  getPageRole(params) {
    return getApiData('/auth/getPageRole', params)
  },

  // Lấy thông tin người dùng hiện tại (Service phụ trợ)
  getUserInfo(params) {
    return getApiData('/user/info', params)
  },
}