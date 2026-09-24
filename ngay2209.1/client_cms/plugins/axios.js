// plugins/axios.js
import Cookies from 'js-cookie'
import { removeCookies } from '~/utils/heppers'

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function ({ $axios, store, redirect, $showError }) {
  // ---------------- REQUEST INTERCEPTOR ----------------
  $axios.onRequest((config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.common.Authorization = `Bearer ${token}`
    }

    const channel = 'CMS'
    const transid = generateUUID()

    if (config.method === 'get' || config.method === 'delete') {
      config.params = {
        channel,
        transid,
        ...config.params,
      }
    } else if (config.method === 'post' || config.method === 'put') {
      if (!(config.data instanceof FormData)) {
        config.data = {
          channel,
          transid,
          ...config.data,
        }
      }
    }

    store.commit('SET_LOADING', true)

    return config
  })

  // ---------------- RESPONSE INTERCEPTOR ----------------
  $axios.onResponse((response) => {
    store.commit('SET_LOADING', false)

    const responseData = response.data
    if (responseData && responseData.status === 1) {
      handleUnauthenticated(store, redirect, $showError)
      return { success: false, data: null }
    }

    return {
      success: true,
      data: responseData ? responseData.data : null,
    }
  })

  // ---------------- ERROR INTERCEPTOR ----------------
  $axios.onError((error) => {
    store.commit('SET_LOADING', false)

    const statusCode = error.response ? error.response.status : null
    const errorData = error.response ? error.response.data : null

    if (statusCode === 401) {
      handleUnauthenticated(store, redirect, $showError)
      return Promise.resolve({ success: false, data: null })
    }

    if (errorData && errorData.error && errorData.error.message) {
      $showError(errorData.error.message)
    } else {
      $showError('Có lỗi xảy ra, vui lòng thử lại sau!')
    }

    return Promise.resolve({
      success: false,
      data: errorData,
    })
  })
}

function handleUnauthenticated(store, redirect, $showError) {
  removeCookies()
  if (typeof $showError === 'function') {
    $showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
  }
  redirect('/dang-nhap')
}
