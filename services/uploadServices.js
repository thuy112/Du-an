import Api from "~/api/Api.js";

class UploadServices {
    async upload(data) {
        return await Api.postMultipart("/file/upload", data);
    }
}

export default new UploadServices();
