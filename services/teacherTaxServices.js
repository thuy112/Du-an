import Api from '~/api/Api.js'

const teacherTaxServices = {
  async getTeacherTax(params) {
    return await Api.get('/api/teacher-tax', params)
  },
  async createTeacherTax(data) {
    return await Api.post('/api/teacher-tax', data)
  },
  async deleteTeacherTax(id, params) {
    return await Api.delete(`/api/teacher-tax/${id}`, params)
  },
  async getSemesters(params) {
    return await Api.get('/api/semester/list', params)
  },
  async updateTeacherTax(id) {
    return await Api.put("/api/teacher-tax/update-tax", id);
  },
}

export default teacherTaxServices