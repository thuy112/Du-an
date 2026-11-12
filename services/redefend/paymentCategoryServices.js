import Api from "~/api/Api.js";

export default {
     getList(params) {
        return Api.get("/api/redefense/paymentCategory", params);
    },

     add(params) {
        return Api.post("/api/redefense/paymentCategory", params);
    },

     update(params) {
        return Api.put(`/api/redefense/paymentCategory/${params.id}`, params);
    },
}


