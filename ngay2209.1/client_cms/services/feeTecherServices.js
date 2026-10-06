// Thù lao / thù lao giảng dạy học lại cho giảng viên.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/fee-teachers', { params })
  },

  calculateFee(params) {// Tính toán thù lao giảng dạy học lại cho giảng viên
    return Api.post('/api/v1/fee-teachers/calculate', params)
  },

  exportExcel(params) {// Xuất file excel thù lao giảng dạy học lại cho giảng viên
    return Api.getBlob('/api/v1/fee-teachers/export', { params })
  },
}