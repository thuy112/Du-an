import Api from "~/api/Api.js"

export default {
  getList(params) {
    return  Api.get("/api/semester", params)
  },

  addNew(params) {
    return  Api.post("/api/semester", params)
  },

  getDetail(id) {
    return  Api.get(`/api/semester/${id}`)
  },

  update( params) {
    return  Api.put(`/api/semester/${params.id}`, params)
  },

  delete(id) {
    return  Api.delete(`/api/semester/${id}`)
  },

  changeStatus(params){
    return  Api.put(`/api/semester/changeStatus/${params.id}`,params)
  },

  getAll(status) {
    return  Api.get("/api/semester/list",status )
  },
}

