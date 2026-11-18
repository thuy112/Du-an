import Api from "~/api/Api.js";

export default {
    upload(data) {
        return Api.postMultipart("/api/file/upload", data);
    }
}


