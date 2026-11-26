import Api from '~/api/Api.js'

export default {
  getFeeTeachers(params) {
    return Api.get('/api/feeTeacher', params)
  },
  createFeeTeacher(data) {
    return Api.post('/api/feeTeacher', data)
  },
  updateFeeTeacher(id, data) {
    return Api.put(`/api/feeTeacher/${id}`, data)
  },
  getTrainingMethods(params) {
    return Api.get('/api/trainingMethod/list', params)
  },
  getRegisteredStudents(params) {
    return Api.get('/api/registerRetakeCourse', { params })
  },
}

