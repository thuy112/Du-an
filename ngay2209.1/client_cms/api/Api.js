// api/Api.js
class Api {
  constructor() {
    this.$axios = null
  }

  // Đánh dấu gắn $axios từ Nuxt Plugin
  setAxios(axiosInstance) {
    this.$axios = axiosInstance
  }

  get(url, params = {}, config = {}) {
    return this.$axios.$get(url, { params, ...config })
  }

  post(url, data = {}, config = {}) {
    return this.$axios.$post(url, data, config)
  }

  put(url, data = {}, config = {}) {
    return this.$axios.$put(url, data, config)
  }

  delete(url, params = {}, config = {}) {
    return this.$axios.$delete(url, { params, ...config })
  }

  // Phương thức tải file binary (Blob)
  getBlob(url, params = {}, config = {}) {
    return this.$axios.$get(url, {
      params,
      responseType: 'blob',
      ...config,
    })
  }

  // Phương thức Upload File (FormData)
  postMultipart(url, formData, config = {}) {
    return this.$axios.$post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
  }
}

const ApiInstance = new Api()
export default ApiInstance
