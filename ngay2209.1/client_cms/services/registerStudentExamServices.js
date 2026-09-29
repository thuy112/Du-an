import Api from '~/api/Api.js'

const registerStudentExamServices = {
  async getAllowedStudents(params) {
    return await Api.get('/api/v1/retake-exam/allowed-students', { params })
  },

  async importAllowedStudents(formData) {
    return await Api.postMultipart('/api/v1/retake-exam/allowed-students/import', formData)
  },

  async getRegisteredStudents(params) {
    return await Api.get('/api/v1/retake-exam/registered-students', { params })
  },

  async approveRegistration(id, data) {
    return await Api.put(`/api/v1/retake-exam/registered-students/${id}/approve`, data)
  },

  async cancelRegistration(id) {
    return await Api.delete(`/api/v1/retake-exam/registered-students/${id}`)
  },
}

export default registerStudentExamServices
