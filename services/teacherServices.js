import Api from '~/api/Api.js'

export default {
  getTeachers(params) {
    return Api.get('/api/teacher', params)
  },

  updateTeacherStatus(id, data) {
    return Api.put(`/api/teacher/${id}`, data)
  },

  getWorkUnits(params) {
    return Api.get('/api/workUnit/list', params)
  },

  getPageRole(params) {
    return Api.get('/api/auth/getPageRole', params)
  },

  getUserInfo(params) {
    return Api.get('/api/user/info', params)
  },

  assignTeacher(classId, data) {
    return Api.put(`/api/retakeSession/${classId}`, data)
  },

  getList(params) {
    return Api.get('/api/teacher', params)
  },

  addNew(params) {
    return Api.post('/api/teacher', params)
  },

  getAll(status) {
    return Api.get('/api/teacher/list', status)
  },

  getDetail(id) {
    return Api.get(`/api/teacher/${id}`)
  },

  update(params) {
    return Api.put(`/api/teacher/${params.id}`, params)
  },

  changeStatus(params) {
    return Api.put(`/api/teacher/changeStatus/${params.id}`, params)
  },

  delete(id) {
    return Api.delete(`/api/teacher/${id}`)
  },

  deleteMulti(ids) {
    return Api.post('/api/teacher/deleteTeachers', ids)
  },

  confirmImport(teachers) {
    return Api.post('/api/teacher/importExcel', teachers)
  },

  checkImport(file) {
    const form = new FormData()
    form.append('file', file)
    // Kiểm tra nếu Api hỗ trợ postMultipart, ngược lại dùng Api.post
    if (typeof Api.postMultipart === 'function') {
      return Api.postMultipart('/api/teacher/checkImport', form)
    }
    return Api.post('/api/teacher/checkImport', form)
  },

  getTemplate() {
    return Api.get('/api/teacher/templateImport')
  },

  getTeacherChangeHistories(teacherId) {
    return Api.get(`/api/teacher/teacherChangeHistories/${teacherId}`)
  },

  export(params) {
    return Api.get('/api/teacher/exportExcel', params)
  },

  getListTeacherByClass(ids) {
    return Api.get(`/api/teacher/rc/listByClass?ids=${ids}`)
  },
}