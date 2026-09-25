class Api {
  constructor() {
    this.$axios = null
  }

  init($axios) {
    this.$axios = $axios
  }

  get(url, config = {}) {
    return this.$axios.$get(url, config)
  }

  post(url, data, config = {}) {
    return this.$axios.$post(url, data, config)
  }

  put(url, data, config = {}) {
    return this.$axios.$put(url, data, config)
  }

  delete(url, config = {}) {
    return this.$axios.$delete(url, config)
  }

  postMultipart(url, formData, config = {}) {
    return this.$axios.$post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    })
  }
}

export default new Api()