import Api from '~/api/Api.js'

const feeTeacherServices = {
  async getFeeTeachers(params) {
    return await Api.get('/api/feeTeacher', params)
  },
  async createFeeTeacher(data) {
    return await Api.post('/api/feeTeacher', data)
  },
  async updateFeeTeacher(id, data) {
    return await Api.put(`/api/feeTeacher/${id}`, data)
  },
  async getTrainingMethods(params) {
    return await Api.get('/api/trainingMethod/list', params)
  },
  getRegisteredStudents($axios, params) {
    return $axios.$get('/api/registerRetakeCourse', { params })
  },
}

export default feeTeacherServices