import Api from "~/api/Api.js"

export default {
  getList(params) {
    return Api.get("/api/trainingUnit", params)
  },

  addNew(params) {
    return Api.post("/api/trainingUnit", params)
  },

  getDetail(id) {
    return Api.get(`/api/trainingUnit/${id}`)
  },

  update(id, params) {
    return Api.put(`/api/trainingUnit/${id}`, params)
  },

  delete(id) {
    return Api.delete(`/api/trainingUnit/${id}`)
  },

  changeStatus(data) {
    return Api.put("/api/trainingUnit/changeStatus/" + data.id, data)
  },

  getAll(status) {
    return Api.get("/api/trainingUnit/list",status )
  },
}

