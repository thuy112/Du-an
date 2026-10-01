// Quản lý định mức & thông tin học phí.
import Api from '~/api/Api'

export default {
  getList(params) {
    return Api.get('/api/v1/tuition-fees', { params })
  },

  updateFeeRate(data) {
    return Api.post('/api/v1/tuition-fees/rate', data)
  },

  exportExcel(params) {
    return Api.getBlob('/api/v1/tuition-fees/export', { params })
  },
}