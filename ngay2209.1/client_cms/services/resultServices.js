import Api from '~/api/Api.js'

const resultServices = {
  async getStudentResult(studentId) {
    return await Api.get(`/api/v1/results/student/${studentId}`)
  },

  async lockResults(params) {
    return await Api.post('/api/v1/results/lock', params)
  },
}

export default resultServices