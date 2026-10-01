let $axios = null

export default {
  // Hàm khởi tạo instance $axios từ plugin Nuxt
  init(axiosInstance) {
    $axios = axiosInstance
  },

  get(url, config = {}) {
    return $axios.$get(url, config)
  },

  post(url, data, config = {}) {
    return $axios.$post(url, data, config)
  },

  put(url, data, config = {}) {
    return $axios.$put(url, data, config)
  },

  delete(url, config = {}) {
    return $axios.$delete(url, config)
  },

  postMultipart(url, formData, config = {}) {
    return $axios.$post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(config.headers || {}),
      },
    })
  },
}