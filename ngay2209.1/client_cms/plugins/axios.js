import { CHANNEL } from '~/consts/consts'
import { getToken, removeCookies } from '~/utils/heppers'

// Hàm tự sinh UUID v4 không phụ thuộc package ngoài
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function ({ $axios, store, redirect, app }) {
  // Request Interceptor
  $axios.onRequest((config) => {
    store.commit('SET_LOADING', true)

    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Chèn channel và transid (trừ FormData)
    if (!(config.data instanceof FormData)) {
      if (['get', 'delete'].includes(config.method.toLowerCase())) {
        config.params = {
          channel: CHANNEL,
          transid: generateUUID(),
          ...config.params,
        }
      } else if (['post', 'put'].includes(config.method.toLowerCase())) {
        config.data = {
          channel: CHANNEL,
          transid: generateUUID(),
          ...config.data,
        }
      }
    }

    return config
  })

  // Response Interceptor
  $axios.onResponse((response) => {
    store.commit('SET_LOADING', false)
    if (response.data && response.data.data !== undefined) {
      return { success: true, data: response.data.data }
    }
    return { success: true, data: response.data }
  })

  // Error Interceptor
  $axios.onError((error) => {
    store.commit('SET_LOADING', false)
    const status = error.response ? error.response.status : null

    if (status === 401) {
      removeCookies()
      if (app.$showError) app.$showError('Phiên đăng nhập đã hết hạn')
      redirect('/dang-nhap')
    } else {
      const msg = error.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại'
      if (app.$showError) app.$showError(msg)
    }

    return { success: false, error }
  })
}