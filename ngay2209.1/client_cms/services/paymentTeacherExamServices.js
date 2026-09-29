import Api from '~/api/Api.js'

const paymentTeacherExamServices = {
  async getTeacherPayments(params) {
    return await Api.get('/api/v1/teacher-exam-payments', { params })
  },

  async updatePaymentNorms(id, data) {
    return await Api.put(`/api/v1/teacher-exam-payments/${id}`, data)
  },

  async confirmPayment(data) {
    return await Api.post('/api/v1/teacher-exam-payments/confirm', data)
  },

  async exportTeacherPaymentReport(params) {
    return await Api.getBlob('/api/v1/teacher-exam-payments/export', { params })
  },
}

export default paymentTeacherExamServices